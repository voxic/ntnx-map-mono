import React, {useState, useRef} from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Alert from '@material-ui/lab/Alert';
import { useAuth } from '../../contexts/AuthContext';
import { useHistory } from 'react-router-dom'


// Component to display the Add prism central modal
export default function AddModal({ open, handleClose }) {

    const [error, setError] = useState()
    const [loading, setLoading] = useState('')

    const { currentUser, refreshToken } = useAuth();

    const history = useHistory();

    const pcNameRef = useRef()
    const pcURLRef = useRef()
    const usernameRef = useRef()
    const passwordRef = useRef()

    function handleCloseClick(){
        handleClose(false);
    };

    function handleConfirm(){

        setError()
        if(!pcNameRef.current.value) { setError(<Alert severity="error">Name is required!</Alert>); return }
        if(!pcURLRef.current.value) { setError(<Alert severity="error">URL is required!</Alert>); return }
        if(!usernameRef.current.value) { setError(<Alert severity="error">Username is required!</Alert>); return }
        if(!passwordRef.current.value) { setError(<Alert severity="error">Password is required!</Alert>); return }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "authorization" : currentUser.accessToken },
            body: JSON.stringify({ 
                pc_name: pcNameRef.current.value,
                pc_url: pcURLRef.current.value,
                username : usernameRef.current.value,
                password :  passwordRef.current.value})
        };
        
        try {
            fetch(process.env.REACT_APP_API_BASE_URL + "/api/v1/pc", requestOptions)
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
            .then(data => {
                if(data.success){
                    handleClose(false);
                } else {
                    setError(<Alert severity="error">Unable to add Prism Central</Alert>)
                }
            })
            .catch(async (err) => {

                if(err === 403){
                  await refreshToken().then(()=>{
                    // New token saved to localstorage
                    
                  })
                }
                else {
                  history.push('/login')
                }
      
              })
        } catch(e){

        }   
    }

 

    return (
        <>
        <Dialog
            open={open}
            onClose={handleCloseClick}
            maxWidth='sm'
            fullWidth={true}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Add Prism Central"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
            {error}
            <form noValidate autoComplete="off">
                <Grid container spacing={2}>
                    <Grid item xs={6} md={6} lg={6}>
                    <TextField
                        id="standard-helperText"
                        label="Prism Central Name"
                        required
                        inputRef={pcNameRef}
                    />
                    </Grid>
                    <Grid item xs={6} md={6} lg={6}>
                    <TextField
                        id="standard-helperText"
                        label="Prism Central URL"
                        helperText="ex https://xx.xx.xx.xx:9440"
                        required
                        inputRef={pcURLRef}
                    />
                    </Grid>
                    <Grid item xs={6} md={6} lg={6}>
                    <TextField
                        id="standard-helperText"
                        label="Username"
                        required
                        inputRef={usernameRef}
                    />
                    </Grid>
                    <Grid item xs={6} md={6} lg={6}>
                    <TextField
                        id="standard-helperText"
                        label="Password"
                        required
                        type="password"
                        inputRef={passwordRef}
                    />
                    </Grid>                                                              
                </Grid>
            </form>
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleCloseClick} color="primary">
                Cancel
            </Button>
            <Button onClick={handleConfirm} color="primary" autoFocus>
                Confirm
            </Button>
            </DialogActions>
        </Dialog>            
        </>
    )
}
