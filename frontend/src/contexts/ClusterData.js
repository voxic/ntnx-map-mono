import { Repeat } from '@material-ui/icons';
import React, { useContext, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
require('dotenv').config()

const ClusterDataContext = React.createContext()

export function useClusterData(){
    return useContext(ClusterDataContext);
}


// Context for location data across the app
export function ClusterData( { children }) {

    const [locations, setLocations] = useState([]); // Main locations store

    const history = useHistory();

    const { currentUser, refreshToken } = useAuth();


    // State for array of locations with different status
    const [locationStatus, setLocationStatus] = useState({"Healthy" : [], "Warning" : [], "Critical" : [], "Disconnected" : []});
    
    const [lines, setLines] = useState([]); // Lines for DR

    const [ dataRefreshed, setDataRefreshed ] = useState(new Date().toISOString()) // Last time data was fetched, will be updated each refresh.
    const [loading, setLoading] = useState(true);

    // Function to fetch all locations from API back-end
    function fetchLocations(){
        const newLocations = []
        setLoading(true);
  
        try {
          fetch(process.env.REACT_APP_API_BASE_URL + '/api/v1/sites', { headers : { "authorization" : currentUser.accessToken }})
          .then(response => {
            if(response.ok){
              return response.json()
            }
            if(response.status == 401){
              history.push('/login')
              throw new Error("401 Unauthorized")
            }
            if(response.status == 403){
              throw 403
            }          
            throw new Error("Unknown error")
          })
          .then(pEs => {
            var tempLocationStatus = {"Healthy" : [], "Warning" : [], "Critical" : [], "Disconnected" : []};
            tempLocationStatus.Healthy = pEs.filter(pe => pe.status == "Healthy")
            tempLocationStatus.Warning = pEs.filter(pe => pe.status == "Warning")
            tempLocationStatus.Critical = pEs.filter(pe => pe.status == "Critical")
            tempLocationStatus.Disconnected = pEs.filter(pe => pe.status == "Disconnected")
            setLocationStatus(tempLocationStatus);
    
            pEs.map((pe, index) => {
              if(pe.lat){
                var tempColor = "lightgreen"
                if(pe.status == "Warning"){
                  tempColor = "#b3ff00"
                }
                else if(pe.status == "Critical"){
                  tempColor = "red"
                }
                else if(pe.status == "Disconnected"){
                  tempColor = "lightgrey"
                }
    
                var tempPe = {...pe}
    
                tempPe.color = tempColor;
                tempPe.lat = parseFloat(pe.lat);
                tempPe.lon = parseFloat(pe.long);
    
                newLocations.push(tempPe);
              }
            })
          
            setLocations(newLocations);
    
          const locWithRemote = newLocations.filter(loc => loc.remote_sites);
          var newLines = [];
          locWithRemote.map(loc => {
            loc.remote_sites.map(rem => {
              const siteB = newLocations.find(loc => loc.uuid == rem.remote_site_uuid)
                newLines.push({
                id: rem.remote_site_uuid,
                from: [loc.lon, loc.lat],
                to: [siteB.lon, siteB.lat],
                color: "green"
              })
            })
    
    
            })
          setLines(newLines);
          setDataRefreshed(new Date().toISOString())
          setLoading(false);
          
        }).catch(async (err) => {

          if(err === 403){
            await refreshToken().then(()=>{
              // token saved to local storage
              
            })
          }
          else {
            history.push('/login')
          }

        })
      }
      catch(e){
        
      }
    }

    useEffect(()=>{
        fetchLocations()
    },[])

    const value = {
        locations,
        locationStatus,
        lines,
        fetchLocations,
        dataRefreshed,
        loading
    }

    return (
        <ClusterDataContext.Provider value={value}>
        {children}
        </ClusterDataContext.Provider>
    )
}
