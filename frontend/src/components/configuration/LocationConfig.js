import React, {useEffect, useState} from 'react';
import MainMenu from '../MainMenu';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { DataGrid } from '@material-ui/data-grid';
import Link from '@material-ui/core/Link';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import EditModal from './EditModal';
import { useParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useHistory } from 'react-router-dom'


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
      height: "85vh",
    },
  }));


// Component for editting prism elments entrys
const LocationConfig = () => {

    const classes = useStyles();

    const [prismElements, setPrismElements] = useState([])
    const [rows, setRows] = useState([])

    const [loading, setLoading] = useState(false);

    const [editModal, setEditModal] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(false);

    const { currentUser, refreshToken } = useAuth();

    const history = useHistory();

    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

    // Create columns for DataGrid
    const columns = [
      { field: 'id', headerName: 'ID', hide: true},
      { field: 'peName', headerName: 'Location name', flex: 1},
      { field: 'peURL', headerName: 'Prism Elements URL', 
          renderCell : (params) => (
              <Link href={params.value}>{params.value}</Link>
          ),  flex: 1},
      {field: 'lat', headerName: 'Latitude', flex: 1},
      {field: 'long', headerName: 'Longitude', flex: 1},
      {field: 'edit', headerName: ' ',           
        renderCell : (params) => (
          <Button variant="outlined" color="primary" id={params.value} onClick={handleEditClick}>Edit</Button>
      )}
  ];

  useEffect(() => {
    var tempRows = []
    prismElements.map((pe) => {
      tempRows.push({
        id : pe._id,
        peName : pe.name,
        peURL : 'https://'+pe.network.external_ip+':9440',
        lat: pe.lat,
        long: pe.long,
        edit: pe._id
      })
    })
    setRows(tempRows)
  }, [prismElements])

  
  function fetchPEs(){
    setLoading(true);
    const newPEs = []

    try{
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
        
        pEs.map(pe => {
          newPEs.push({...pe})
        })
        setPrismElements(newPEs);
        setLoading(false);
      })
      .catch(async (err) => {

        if(err === 403){
          await refreshToken().then(()=>{
            // new token saved to local storage
            
          })
        }
        else {
          history.push('/login')
        }

      })
    } catch(e){

    }
  }

  useEffect(()=>{

    fetchPEs();

  }, [])

  useEffect(()=>{
    if(currentLocation){
      setEditModal(true);
    }
  }, [currentLocation])

  function handleCloseEditModal(){
    setEditModal(false);
    fetchPEs();
  }

  function handleEditClick(e){
    const tempLoc = prismElements.find(pe => pe._id == e.target.parentElement.id)
    setCurrentLocation(tempLoc)
    
  }

    return (
        <div className={classes.root}>
        <CssBaseline />
        <MainMenu title={"Location configuration"} />
        <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth="xl" className={classes.container}>
                <EditModal open={editModal} handleClose={handleCloseEditModal} location={currentLocation} />
                <Paper className={fixedHeightPaper}>
                <Grid container spacing={2} >
                    <Grid direction="row" container item justify="space-between" spacing={2}>
                        <Grid item xs={12} md={12}>
                        <Typography variant="h3">Configuration of locations</Typography>
                        <Box textAlign="left">In order for clusters to be shown on the main dashboard longitude and latitude needs to be configured below.</Box>
                        </Grid>
                        <Grid item xs={12} md={12} lg={12}>
                      <div style={{ height: '65vh'}}>
                          <DataGrid rows={rows} columns={columns} disableSelectionOnClick autoPageSize={true} />
                      </div>
                    </Grid>                        
                    </Grid>                    
                </Grid>
                </Paper>
            </Container>
        </main>
        </div>
    );
}

export default LocationConfig;
