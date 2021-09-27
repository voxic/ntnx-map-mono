import React from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useAuth } from '../../contexts/AuthContext';
import { useHistory } from 'react-router-dom'


// Component for displaying Confirm Delete dialog
export default function ConfirmDelete({ open, locations, handleClose }) {

    const { currentUser, refreshToken } = useAuth();
    const history = useHistory();

    function handleCloseClick(){
        handleClose(false);
    };

    function handleConfirm(){
        locations.map((pc) => {
            const requestOptions = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', "authorization" : currentUser.accessToken },
                body: ''
              };
          
            try{
              fetch(process.env.REACT_APP_API_BASE_URL + "/api/v1/pc/id/"+pc._id, requestOptions)
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
                    
                  } else {
                    console.log("Error remove")
                  }
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
        }) 
        handleClose(false);
    }

    return (
        <>
        <Dialog
            open={open}
            onClose={handleCloseClick}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                Click "confirm" to remove listed Prism Central entrys
                <ul>
                    { locations.map((pc) => 
                        <li>{pc.pc_name}</li>
                    )}
                </ul>
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
