import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import MainMenu from '../MainMenu';
import Map from './Map';
import ClusterStatusCard from './ClusterStatusCard';
import { useState, useEffect } from 'react'
import ClusterDetails from './ClusterDetails';
import { useClusterData } from '../../contexts/ClusterData'
import RefreshIcon from '@material-ui/icons/Refresh';
import Button from '@material-ui/core/Button';

// Component styles
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: "75vh",
    position: 'relative'
  },
  refreshText: {
    color: 'lightgrey',
    position: 'absolute',
    zIndex: '10',
    right: '10px',
    bottom: '10px',    
  },
  refreshButton: {
    width: '100px',
    position: 'absolute',
    zIndex: '10',
    right: '10px',
    top: '10px',
  }
}));

export default function Dashboard() {

  const classes = useStyles(); // Component styles instance

  const [clusterDetails, setClusterDetails] = useState(false); // Controls if cluster details popUp is shown
  const [currentClusterDetails, setCurrentClusterDetails] = useState({});  // The currently clicked clusters details
  const [currentClusterDetailsLoaded, setCurrentClusterDetailsLoaded] = useState(false); // Bool to check if cluster data is loaded

  const { locations, lines, locationStatus, fetchLocations, dataRefreshed, loading } = useClusterData(); // Cluster data context

  // Callback for showing lines on mouseOver
  function handleMouseOver(e){
    let lines = [...document.getElementsByClassName(e.target.id)]
    lines.map(line => {
      line.style.display = "block";
    });
  }

  // Callback for hiding lines on mouseOut
  function handleMouseOut(e){
    let lines = [...document.getElementsByClassName(e.target.id)]
    lines.map(line => {
      line.style.display = "none";
    });
  }
  
  // Callback for refresh button
  function handleRefresh(){
    fetchLocations();
  }  

  // Callback for handling clicking on a Cluster dot
  function handleClick(e){
    setCurrentClusterDetails(locations.find(loc => loc.uuid == e.target.id))
    setClusterDetails(true)
    setCurrentClusterDetailsLoaded(true);
  }

  // Callback for closing clusterdetails pop-up
  function handleClusterDetails(){
    setCurrentClusterDetailsLoaded(false);
    setCurrentClusterDetails({})
    setClusterDetails(!clusterDetails)
  }

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight); // class reference for paper body for map

  return (
    <div className={classes.root}>
      <CssBaseline />
      <MainMenu title={"Dashboard"} />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="xl" className={classes.container}>        
          { currentClusterDetailsLoaded ? <ClusterDetails open={clusterDetails} location={currentClusterDetails} handleClusterDetails={handleClusterDetails} /> : ' ' }
          <Grid container direction="row" spacing={1}>
            <Grid container item justify="space-between" spacing={2} >
              <Grid xs item>
                <ClusterStatusCard color="lightgreen" title="Healthy" number={locationStatus.Healthy.length}/>
              </Grid>
              <Grid xs item>
                <ClusterStatusCard color="#b3ff00" title="Warning" number={locationStatus.Warning.length}/>
              </Grid>
              <Grid xs item>
                <ClusterStatusCard color="red" title="Critical" number={locationStatus.Critical.length}/>
              </Grid>
              <Grid xs item>
                <ClusterStatusCard color="lightgrey" title="Disconnected" number={locationStatus.Disconnected.length}/>
              </Grid>              
            </Grid>                    
              {/* Map */}              
              <Grid item xs={12} md={12} lg={12}>             
                <Paper className={fixedHeightPaper}>                
                  { !loading ? <Map locations={locations} lines={lines} handleMouseOver={handleMouseOver} handleMouseOut={handleMouseOut} handleClick={handleClick} /> : 'No map' }
                  <div className={classes.refreshText}>{String(dataRefreshed).replace('T', ' ').replace('Z', '')}</div>
                  <Button
                            variant="contained"
                            color="primary"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            className={classes.refreshButton}
                        >
                            Update
                        </Button>
                </Paper>
              </Grid>            
          </Grid>          
        </Container>       
      </main>    
    </div>
  );
}
