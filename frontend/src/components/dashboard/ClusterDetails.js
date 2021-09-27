import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Link from '@material-ui/core/Link';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import PublicIcon from '@material-ui/icons/Public';
import StorageIcon from '@material-ui/icons/Storage';
import MemoryIcon from '@material-ui/icons/Memory';
import SelectAllIcon from '@material-ui/icons/SelectAll';
import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows';
import ViewAgendaIcon from '@material-ui/icons/ViewAgenda';
import { useHistory } from 'react-router-dom'


export default function ResponsiveDialog({open, handleClusterDetails, location}) {
  const theme = useTheme();

  const history = useHistory();

  function handleClick(){
      handleClusterDetails()
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClick}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">Nutanix Cluster</DialogTitle>
        <DialogContent style={{ minWidth : 400}}>
          <DialogContentText>
            <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                    <Typography variant="h6">
                    <Link onClick={()=>{ history.push('/clusterdetails/'+location._id)}}>{location.name}</Link> - {location.status}
                    </Typography>
                    <Typography variant="h9">
                    Last updated - {String(location.metadata.last_update_time).replace('T', ' ').replace('Z', '')}
                    </Typography>                    
                        <List dense={true}>
                            <Divider />
                            <Typography variant="h7">
                            Management
                            </Typography>                             
                            <ListItem>
                                <ListItemIcon>
                                    <PublicIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Prism Element URL"
                                    secondary={ <Link target="_blank" href={'https://'+ location.network.external_ip +':9440'}>https://{location.network.external_ip}:9440</Link> }
                                />
                                </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <PublicIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Prism Central URL"
                                    secondary={ <Link target="_blank" href={location.pc_url}>{location.pc_url}</Link> }
                                />
                            </ListItem>
                            <Divider />
                        </List>
                        <Typography variant="h7">
                            Metrics
                        </Typography>                           
                        <Grid container spacing={1}>
                            <Grid item xs={6} md={6}>
                                <List dense={true}>
                                    <ListItem>
                                        <ListItemIcon>
                                            <StorageIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Storage capacity"
                                            secondary={ location.storage_capacity_bytes }
                                        />
                                    </ListItem>
                                </List>
                            </Grid>                         
                            <Grid item xs={6} md={6}>
                                <List dense={true}>
                                    <ListItem>
                                        <ListItemIcon>
                                            <StorageIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Storage used"
                                            secondary={ location.storage_usage_bytes }
                                        />
                                    </ListItem>
                                </List>
                            </Grid>
                            <Grid item xs={6} md={6}>
                                <List dense={true}>
                                    <ListItem>
                                        <ListItemIcon>
                                            <MemoryIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Memory usage"
                                            secondary={ location.memory_usage_ppm }
                                        />
                                    </ListItem>
                                </List>
                            </Grid> 
                            <Grid item xs={6} md={6}>
                                <List dense={true}>
                                    <ListItem>
                                        <ListItemIcon>
                                            <SelectAllIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="CPU usage"
                                            secondary={ location.cpu_usage_ppm }
                                        />
                                    </ListItem>
                                </List>
                            </Grid>                                                                                     
                        </Grid>
                        <Divider />
                        <Typography variant="h7">
                            Workloads
                        </Typography>                           
                        <Grid container spacing={1}>
                            <Grid item xs={6} md={6}>
                                <List dense={true}>
                                    <ListItem>
                                        <ListItemIcon>
                                            <ViewAgendaIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Nodes"
                                            secondary={ location.num_nodes }
                                        />
                                    </ListItem>
                                </List>
                            </Grid>                         
                            <Grid item xs={6} md={6}>
                                <List dense={true}>
                                    <ListItem>
                                        <ListItemIcon>
                                            <DesktopWindowsIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="VMs"
                                            secondary={ location.num_vms }
                                        />
                                    </ListItem>
                                </List>
                            </Grid>                                                      
                        </Grid>                                                                                               
                </Grid>
            </Grid>            
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClick} color="Secondary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
