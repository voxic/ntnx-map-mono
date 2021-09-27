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
import { useParams } from 'react-router';
import AddUserModal from './AddUserModal';
import ConfirmDeleteUser from './ConfirmDeleteUser';
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
      height: "70vh",
    },
  }));

const UserConfig = () => {

    const classes = useStyles();

    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
    
    const [rows, setRows] = useState([])

    const [users, setUsers] = useState([])

    const [currentUserID, setCurrentUserID] = useState('')

    const [loading, setLoading] = useState(false);

    const [deleteButtonState, setDeleteButtonState] = useState(true);

    const [confirmDeleteModalState, setConfirmDeleteModalState] = useState(false)

    const [addModalState, setAddModalState] = useState(false)

    const { currentUser, refreshToken } = useAuth();

    const history = useHistory();

    // Create columns for DataGrid
    const columns = [
      { field: 'id', headerName: 'ID', hide: true},
      { field: 'username', headerName: 'Username', flex: 1},
      {field: 'delete', headerName: ' ',           
        renderCell : (params) => (
          <Button variant="contained" color="secondary" id={params.value} onClick={handleClickDelete}>Delete</Button>
      )}
    ];    

    function handleAddModalClose(){
      setAddModalState(false)
      fetchUsers()
    }

    function handleClickAdd(){
      setAddModalState(true)
    }

    function handleClickDelete(e){
      
      setCurrentUserID(e.target.parentElement.id)
      setConfirmDeleteModalState(true)
    }

    function handleConfirmModalClose(){
      setConfirmDeleteModalState(false)
      setTimeout(() => {
        fetchUsers()
      }, 100);
      
    }

    function fetchUsers(){
      
      setLoading(true);
  
      try {
        fetch(process.env.REACT_APP_API_BASE_URL + '/api/v1/users', { headers : { "authorization" : currentUser.accessToken }})
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
        .then(users => {
          setUsers(users);
          setLoading(false);
        })
        .catch(async (err) => {

          if(err === 403){
            await refreshToken().then(()=>{
              console.log("Got a new token")
              
            })
          }
          else {
            history.push('/login')
          }

        })
      } catch(e) {
        
      }
    }

    useEffect(() => {
      setRows([])
      
      var tempRows = []
      users.map((user) => {
        tempRows.push({
          id : user._id,
          username : user.username,
          delete: user._id
        })
      })
      setRows(tempRows)
    }, [users])


    useEffect(()=>{

      fetchUsers();
  
    }, [])


    return (
        <div className={classes.root}>
        <CssBaseline />
        <MainMenu title={"Users"} />
        <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth="xl" className={classes.container}>
              <AddUserModal open={addModalState} handleClose={handleAddModalClose} />
              <ConfirmDeleteUser open={confirmDeleteModalState} handleClose={handleConfirmModalClose} userID={currentUserID} />
                <Paper className={fixedHeightPaper}>
                  <Grid container spacing={2} >
                      <Grid direction="row" container item justify="space-between" spacing={2}>
                          <Grid item xs={12} md={12}>
                          <Typography variant="h3">Configuration of Users</Typography>
                          <Box textAlign="left">Here you can create local users for accessing the UI</Box>
                          </Grid>
                          <Grid item xs={12} md={12} lg={12}>
                            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleClickAdd}>Add user</Button>
                        </Grid>                          
                          <Grid item xs={12} md={12} lg={12}>
                        <div style={{ height: '40vh'}}>                 
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

export default UserConfig;
