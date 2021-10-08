import requests
import urllib3
import json
from pymongo import MongoClient
import time
import math
import threading
import concurrent.futures
from nested_lookup import get_occurrence_of_key
import os

def humanbytes(B):
   'Return the given bytes as a human friendly KB, MB, GB, or TB string'
   B = float(B)
   KB = float(1024)
   MB = float(KB ** 2) # 1,048,576
   GB = float(KB ** 3) # 1,073,741,824
   TB = float(KB ** 4) # 1,099,511,627,776

   if B < KB:
      return '{0} {1}'.format(B,'Bytes' if 0 == B > 1 else 'Byte')
   elif KB <= B < MB:
      return '{0:.2f} KB'.format(B/KB)
   elif MB <= B < GB:
      return '{0:.2f} MB'.format(B/MB)
   elif GB <= B < TB:
      return '{0:.2f} GB'.format(B/GB)
   elif TB <= B:
      return '{0:.2f} TB'.format(B/TB)


def crawler(row, db):
    baseURL = row["pc_url"]
    credentials = row["credentials"]

    pc_cluster_list = []

    # Build the first API call to get all controlled clusters
    url = baseURL + "/api/nutanix/v3/clusters/list"

    payload = "{\"kind\":\"cluster\"}"
    headers = {
        'content-type': "application/json",
        'authorization': "Basic " + credentials
        }

    try:
        response = requests.request("POST", url, data=payload, headers=headers,timeout=15, verify=False)

        if(response.status_code != 200):
            print("Error on calling PC Api: " + response.status_code)
            result = db.pc_config.update_one({"_id" : row["_id"]}, { "$set": { "pc_last_crawled": math.floor(time.time()),"pc_last_crawled_status": "failed - Status code: " + response.status_code}} )            

    except:
        print("Failed to connect to PC: " + row['pc_name'])
        result = db.pc_config.update_one({"_id" : row["_id"]}, { "$set": { "pc_last_crawled": math.floor(time.time()),"pc_last_crawled_status": "Failed - Failed to connect to PC"}} )

        # Set all associated PE clusters as disconnected
        result = db.pe_clusters.update_many({'uuid': {'$in': row["pc_cluster_list"]}}, {'$set': {'status':'Disconnected'}})
        return

    # parse the JSON response
    json_response = json.loads(response.text)

    # For each of the clusters in the result
    for cluster in json_response["entities"]:

        # Check that it's a cluster and not the PC instance
        if cluster['status']['name'] != "Unnamed":
            print("Saving cluster data to DB: " + cluster['status']['name'])

            cluster_data = {
                'name': cluster['status']['name'],
                'nodes': cluster['status']['resources']['nodes']['hypervisor_server_list'] if get_occurrence_of_key(cluster, key='hypervisor_server_list') else '',
                'ncc' : cluster['status']['resources']['config']['software_map']['NCC'] if get_occurrence_of_key(cluster, key='NCC') else '',
                'nos' : cluster['status']['resources']['config']['software_map']['NOS'] if get_occurrence_of_key(cluster, key='NOS') else '',
                'network' : cluster['status']['resources']['network'] if get_occurrence_of_key(cluster, key='network') else '',
                'analysis' : cluster['status']['resources']['analysis'] if get_occurrence_of_key(cluster, key='analysis') else '',
                'metadata' : cluster['metadata'],
                'uuid' : cluster['metadata']['uuid'],
                'last_crawled' : math.floor(time.time()),
                'pc_name' : row['pc_name'],
                'pc_url' : row["pc_url"]
            }

            pc_cluster_list.append(cluster['metadata']['uuid'])

            url = baseURL + "/api/nutanix/v3/groups"
            payload = json.dumps({"entity_type":"cluster","entity_ids":[cluster_data['uuid']],
            "group_member_attributes":[{"attribute":"storage.capacity_bytes"},
            {"attribute":"storage.usage_bytes"},{"attribute":"hypervisor_memory_usage_ppm"},
            {"attribute":"hypervisor_cpu_usage_ppm"},{"attribute":"num_vms"},{"attribute":"num_nodes"}],
            "query_name":"prism:BaseGroupModel"})

            response = requests.request("POST", url, data=payload, headers=headers, verify=False)
            json_response = json.loads(response.text)

            cluster_data['storage_capacity_bytes'] = humanbytes(json_response['group_results'][0]["entity_results"][0]['data'][0]['values'][0]['values'][0])
            cluster_data['storage_usage_bytes'] = humanbytes(json_response['group_results'][0]["entity_results"][0]['data'][1]['values'][0]['values'][0])
            cluster_data['memory_usage_ppm'] = "{:.2f}%".format(float(json_response['group_results'][0]["entity_results"][0]['data'][2]['values'][0]['values'][0]) / 10000)
            cluster_data['cpu_usage_ppm'] = "{:.2f}%".format(float(json_response['group_results'][0]["entity_results"][0]['data'][3]['values'][0]['values'][0]) / 10000)
            cluster_data['num_vms'] = json_response['group_results'][0]["entity_results"][0]['data'][4]['values'][0]['values'][0]
            cluster_data['num_nodes'] = json_response['group_results'][0]["entity_results"][0]['data'][5]['values'][0]['values'][0]

            if(db.pe_clusters.find_one({'uuid' : cluster_data['uuid']})):
                result = db.pe_clusters.update_one({'uuid' : cluster_data['uuid']}, {'$set' : cluster_data })
                print('cluster data updated: {0}'.format(result.modified_count))
            else:
                result = db.pe_clusters.insert_one(cluster_data)
                print('cluster data stored: {0}'.format(result.inserted_id))

    # alerts call
    url = baseURL + "/api/nutanix/v3/alerts/list"
    payload = "{\"kind\":\"alert\"}"
    headers = {
        'content-type': "application/json",
        'authorization': "Basic " + credentials
        }
    response = requests.request("POST", url, data=payload, headers=headers, verify=False)
    # parse the JSON response
    json_response = json.loads(response.text)

    cluster_status = "Healthy"
    alert_statuses = []
    for alert in json_response["entities"]:
        
        alert_msg = ''
        try: 
            alert_msg = alert['status']['resources']['parameters']['alert_msg']['string_value']
        except:
            alert_msg = alert['status']['resources']['title'] 

        alert_statuses.append(alert['status']['resources']['severity'])

        try:
            if 'critical' in alert_statuses:
                cluster_status = "Critical"
            elif 'warning' in alert_statuses:
                cluster_status = "Warning"
            
            if(db.pe_clusters.find_one({'uuid' : alert['status']['resources']['originating_cluster_uuid']})):
                result = db.pe_clusters.update_one(
                {"uuid" : alert['status']['resources']['originating_cluster_uuid']}, 
                { "$set": { "status": cluster_status}})
                print('Updated PE status based on alert: {0}'.format(result.modified_count))

            alert_data = {
                'originating_cluster_uuid': alert['status']['resources']['originating_cluster_uuid'],
                'severity': alert['status']['resources']['severity'],
                'creation_time' : alert['status']['resources']['creation_time'],
                'last_update_time' : alert['status']['resources']['last_update_time'],
                'resolved' : alert['status']['resources']['resolution_status']['is_true'],
                'acknowledged' : alert['status']['resources']['acknowledged_status']['is_true'],
                'resolution_cause_list' : alert['status']['resources']['possible_cause_list'],
                'alert_msg' : alert_msg,
                'alert_uuid' : alert['metadata']['uuid']
            }

            if(db.alerts.find_one({'alert_uuid' : alert_data['alert_uuid']})):
                result = db.alerts.replace_one({'alert_uuid' : alert_data['alert_uuid']}, alert_data)
                print('alert data updated: {0}'.format(result.modified_count))   
            else:
                result = db.alerts.insert_one(alert_data)
                print('alert data stored: {0}'.format(result.inserted_id))
        except:
            print("Failed to set cluster status")          

    
    try:
        result = db.pc_config.update_one(
            {"_id" : row["_id"]}, 
            { "$set": 
                { "pc_last_crawled": math.floor(time.time()), 
                "pc_last_successfull_crawl" : math.floor(time.time()),
                "pc_last_crawled_status": "Success", 
                "pc_cluster_list" : pc_cluster_list}
                })
        print('Updated PC config DB: {0}'.format(result.modified_count))
    except:
        print('Error updating PE status in DB')

    ## Get Remote sites
    for cluster in pc_cluster_list:
        url = baseURL + "/PrismGateway/services/rest/v2.0/remote_sites?proxyClusterUuid=" + cluster
        headers = {
            'content-type': "application/json",
            'authorization': "Basic " + credentials
        }

        try:
            response = requests.request("GET", url, headers=headers, verify=False)

            # parse the JSON response
            json_response = json.loads(response.text)

            remote_sites = []
            for remoteSite in json_response['entities']:
                remote_sites.append({"remote_site_uuid" : remoteSite['uuid'], 
                                    "remote_site_name" : remoteSite['name']})

            result = db.pe_clusters.update_one(
            {"uuid" : cluster}, 
            { "$set": { "remote_sites": remote_sites}})

            print('Updated PE remote sites: {0}'.format(result.modified_count))

        except:
            print('Failed to fetch remote sites')



def temp_crawler(pc, db):
    print("Started crawler on: " + pc['pc_name'])
    time.sleep(2)
    print("Done crawl on: " + pc['pc_name'])


if __name__ == "__main__":

    # connect to MongoDB, change the << MONGODB URL >> to reflect your own connection string
    client = MongoClient(os.getenv('MONGODB_CONNECTION_STRING'))
    db=client[os.getenv('MONGODB_DATABASE')]

    # Disable urllib warnings for unsecure HTTPS
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    # Get all PCs from DB
    pcs_list = db.pc_config.find()

    
    # Create a thread pool and use maximum of 3 workers to crawn all PCs
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        exec_results = {executor.submit(crawler, pc, db): pc for pc in pcs_list}
        for exec_res in concurrent.futures.as_completed(exec_results):
            pc = exec_results[exec_res]
            try:
                data = exec_res.result()
            except Exception as exc:
                print('%r generated an exception: %s' % (pc["pc_name"], exc))
