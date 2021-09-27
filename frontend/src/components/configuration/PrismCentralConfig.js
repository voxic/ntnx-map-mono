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
import ConfirmDelete from './ConfirmDelete';
import AddModal from './AddModal';
import { useAuth } from '../../contexts/AuthContext'
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


// Component for editting prism central entrys
const PrismCentralConfig = () => {

    const classes = useStyles();

    const [prismCentrals, setPrismCentrals] = useState([])
    const [rows, setRows] = useState([])

    const [selectedLocations, setSelectedLocations] = useState([])
    

    const [confirmDeleteModalState, setConfirmDeleteModalState] = useState(false)
    const [addModalState, setAddModalState] = useState(false)

    const [loading, setLoading] = useState(false);

    const [deleteButtonState, setDeleteButtonState] = useState(true);

    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

    const { currentUser, refreshToken } = useAuth();
    const history = useHistory();

    // Create columns for DataGrid
    const columns = [
      { field: 'id', headerName: 'ID', hide: true},
      { field: 'pcName', headerName: 'Location name', flex: 1},
      { field: 'pcURL', headerName: 'Prism Central URL', 
          renderCell : (params) => (
              <Link href={params.value}>{params.value}</Link>
          ),  flex: 1},
      {field: 'lastCrawled', headerName: 'Last crawled', flex: 1},
      {field: 'lastCrawledsuc', headerName: 'Last successful crawl', flex: 1},
      {field: 'status', headerName: 'Status', flex: 1}
  ];

  useEffect(() => {
    var tempRows = []
    prismCentrals.map((pc) => {
      tempRows.push({
        id : pc._id,
        pcName : pc.pc_name,
        pcURL : pc.pc_url,
        lastCrawled : String(new Date(pc.pc_last_crawled * 1000).toISOString()).replace('T', ' ').replace('Z', '').replace('.000',''),
        lastCrawledsuc : String(new Date(pc.pc_last_successfull_crawl * 1000).toISOString()).replace('T', ' ').replace('Z', '').replace('.000',''),
        status : pc.pc_last_crawled_status
      })
    })
    setRows(tempRows)
  }, [prismCentrals])

  
  function fetchPCs(){
    console.log("Fetch!")
    setLoading(true);
    const newPCs = []
    try{
      fetch(process.env.REACT_APP_API_BASE_URL + '/api/v1/pc', { headers : { "authorization" : currentUser.accessToken }})
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
      .then(pCs => {
        
        pCs.map(pc => {
          newPCs.push({...pc})
        })
        setPrismCentrals(newPCs);
        setLoading(false);
      })
      .catch(async (err) => {

        if(err === 403){
          await refreshToken().then(()=>{
            //token stored in local storage
            
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

    fetchPCs();

  }, [])

  function handleSelection(e){
    console.log(e)
    if(e.selectionModel.length > 0){
      setDeleteButtonState(false)

      const selectedLoc = prismCentrals.filter((pc => e.selectionModel.includes(pc._id)))
      setSelectedLocations(selectedLoc)

    }else {
      setDeleteButtonState(true)
      setSelectedLocations([])
    }
  }

  function handleClickDelete(){
    setConfirmDeleteModalState(true)
  }

  function handleClickAdd(){
    setAddModalState(true)
  }

  function handleConfirmModalClose(){
    setConfirmDeleteModalState(false)
    fetchPCs()
  }

  function handleAddModalClose(){
    setAddModalState(false)
    fetchPCs()
  }    

    return (
        <div className={classes.root}>
        <CssBaseline />
        <MainMenu title={"Prism Central configuration"} />
        <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth="xl" className={classes.container}>
                <ConfirmDelete open={confirmDeleteModalState} handleClose={handleConfirmModalClose} locations={selectedLocations} />
                <AddModal open={addModalState} handleClose={handleAddModalClose} />
                <Paper className={fixedHeightPaper}>
                <Grid container spacing={2} >
                    <Grid direction="row" container item justify="space-between" spacing={2}>
                        <Grid item xs={12} md={12}>
                        <Typography variant="h3">Configuration of Prism Centrals</Typography>
                        <Box textAlign="left">In order for clusters to be shown on the main dashboard the controlling Prism Central instance needs to be configured below.<br />
            The following data is required for configuration.
                        <ul>
                          <li>A name for the location</li>
                          <li>URL for the Prism Central</li>
                          <li>Username and password</li>
                        </ul></Box>
                        </Grid>
                        <Grid item xs={12} md={12} lg={12}>
                        <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
                          <Button onClick={handleClickAdd} startIcon={<AddIcon />}>Add</Button>
                          <Button onClick={handleClickDelete} color="secondary" startIcon={<DeleteIcon />} disabled={deleteButtonState} >Delete</Button>
                        </ButtonGroup>
                        </Grid>
                        <Grid item xs={12} md={12} lg={12}>
                      <div style={{ height: '52vh'}}>
                          <DataGrid rows={rows} columns={columns} autoPageSize={true} checkboxSelection onSelectionModelChange={handleSelection}/>
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

export default PrismCentralConfig;
