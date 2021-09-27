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
import { useAuth } from '../../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

export default function EditModal({open, location, handleClose}) {

    const latRef = useRef()
    const longRef = useRef()

    const [error, setError] = useState()

    const { currentUser, refreshToken } = useAuth();

    const history = useHistory();

    // Function to save edit to database
    function updateLocation(location, change){
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', "authorization" : currentUser.accessToken },
            body: JSON.stringify({ 
                lat: change.lat,
                long: change.long})
        };
        
        try{
            fetch(process.env.REACT_APP_API_BASE_URL + "/api/v1/sites/id/" + location._id, requestOptions)
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
                    console.log("Unable to update")
                    setError(<Alert severity="error">Unable to save edit!</Alert>); return
                }
                
            })
            .catch(async (err) => {

                if(err === 403){
                  await refreshToken().then(()=>{
                    // token saved to local storage
                    
                  })
                }
                else {
                  history.push('/login')
                }
      
              })
        } catch(e) {

        }


    }    

    // function called when close modal is clicked
    function handleCloseClick(){
        handleClose()
    }

    // function called when confirm is clicked
    function handleConfirm(){
        const changes = {
            lat : latRef.current.value,
            long : longRef.current.value
        }
        updateLocation(location, changes)
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
            <DialogTitle id="alert-dialog-title">{"Edit Latitude/Longitude"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
            
            {error}
            <form noValidate autoComplete="off">
                <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                Edit Latitude and Longitude for location: {location.name}
                </Grid>
                
                    <Grid item xs={6} md={6} lg={6}>
                    
                    <TextField
                        id="lat"
                        label="Latitude"
                        helperText="ex 59.32"
                        defaultValue={location.lat}
                        required
                        inputRef={latRef}
                    />
                    </Grid>
                    <Grid item xs={6} md={6} lg={6}>
                    <TextField
                        id="long"
                        label="Longitude"
                        helperText="ex 18.123"
                        defaultValue={location.long}
                        required
                        inputRef={longRef}
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
