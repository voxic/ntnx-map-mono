import React, {useState, useRef, useEffect} from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Alert from '@material-ui/lab/Alert';
import { useAuth } from '../../contexts/AuthContext'
import { useHistory } from 'react-router-dom'

export default function AddUserModal({open, handleClose}) {

    const usernameRef = useRef()
    const passwordRef = useRef()
    const noteRef = useRef()

    const { currentUser, refreshToken } = useAuth();

    const history = useHistory();

    const [error, setError] = useState()

    // Function to save edit to database
    function saveUser(user){
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "authorization" : currentUser.accessToken },
            body: JSON.stringify({ 
                username: user.username,
                password: user.password})
        };
        
        try {
            fetch(process.env.REACT_APP_API_BASE_URL + "/api/v1/users/", requestOptions)
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
                    handleClose()
                } else {
                    console.log("Unable to save user")
                    setError(<Alert severity="error">Unable to save user!</Alert>); return
                }
                
            })
            .catch(async (err) => {

                if(err === 403){
                await refreshToken().then(()=>{
                    // Token saved to local storage
                    
                })
                }
                else {
                history.push('/login')
                }
    
            })
        } catch(e){

        }                   


    }    

    // function called when close modal is clicked
    function handleCloseClick(){
        handleClose()
    }

    // function called when confirm is clicked
    function handleConfirm(){
        const user = {
            username : usernameRef.current.value,
            password : passwordRef.current.value
        }
        saveUser(user)
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
            <DialogTitle id="alert-dialog-title">{"Add a new user"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
            
            {error}
            <form noValidate autoComplete="off">
                <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                User info
                </Grid>
                
                    <Grid item xs={6} md={6} lg={6}>
                    
                    <TextField
                        id="username"
                        label="Username"
                        required
                        inputRef={usernameRef}
                    />
                    </Grid>
                    <Grid item xs={6} md={6} lg={6}>
                    <TextField
                        id="password"
                        label="Password"
                        type="password"
                        required
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
                Add
            </Button>
            </DialogActions>
        </Dialog>            
        </>
    )
}
