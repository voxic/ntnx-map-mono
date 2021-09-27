import React from 'react';
import MainMenu from '../MainMenu';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import { useParams } from "react-router-dom";
import { useClusterData } from '../../contexts/ClusterData'
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Link from '@material-ui/core/Link';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import PublicIcon from '@material-ui/icons/Public';
import StorageIcon from '@material-ui/icons/Storage';
import MemoryIcon from '@material-ui/icons/Memory';
import SelectAllIcon from '@material-ui/icons/SelectAll';
import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows';
import ViewAgendaIcon from '@material-ui/icons/ViewAgenda';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';


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

const ClusterDetails = () => {

    const classes = useStyles();

    const { id } = useParams();

    const { locations } = useClusterData(); // Cluster data context

    const currentLocation = locations.find(loc => loc._id == id)

    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

    return (
        <div className={classes.root}>
        <CssBaseline />
        <MainMenu title={"Cluster " + currentLocation.name + " details"} />
        <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth="xl" className={classes.container}>
                <Paper className={fixedHeightPaper}>
                <Grid container spacing={2} >
                    <Grid item xs={12} md={12}>
                    <Typography variant="h4">{currentLocation.name}</Typography>
                    <Typography variant="h9">
                    Last updated - {String(currentLocation.metadata.last_update_time).replace('T', ' ').replace('Z', '')}
                    </Typography>                       
                    </Grid>
                    <Grid item xs={12} md={12} >
                    <Divider />
                        <Typography variant="h7">
                        Management
                          </Typography>
                    </Grid>                 
                    <Grid item xs={12} md={12}>    
                      <List dense={true}>                         
                              <ListItem>
                                  <ListItemIcon>
                                      <PublicIcon />
                                  </ListItemIcon>
                                  <ListItemText
                                      primary="Prism Element URL"
                                      secondary={ <Link href={'https://'+ currentLocation.network.external_ip +':9440'}>https://{currentLocation.network.external_ip}:9440</Link> }
                                  />
                                  </ListItem>
                              <ListItem>
                                  <ListItemIcon>
                                      <PublicIcon />
                                  </ListItemIcon>
                                  <ListItemText
                                      primary="Prism Central URL"
                                      secondary={ <Link href={currentLocation.pc_url}>{currentLocation.pc_url}</Link> }
                                  />
                              </ListItem>
                              
                          </List>
                    </Grid>
                    <Grid item xs={12} md={12} >
                    <Divider />
                        <Typography variant="h7">
                          Metrics
                          </Typography>
                    </Grid>                                                 
                        <Grid item >                         
                            <List dense={true}>                              
                                <ListItem>
                                    <ListItemIcon>
                                        <StorageIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Storage capacity"
                                        secondary={ currentLocation.storage_capacity_bytes }
                                    />
                                </ListItem>
                            </List>
                        </Grid>                         
                        <Grid item alignItems="center" justify="flex-start">
                            <List dense={true}>
                                <ListItem>
                                    <ListItemIcon>
                                        <StorageIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Storage used"
                                        secondary={ currentLocation.storage_usage_bytes }
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid item >
                            <List dense={true}>
                                <ListItem>
                                    <ListItemIcon>
                                        <MemoryIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Memory usage"
                                        secondary={ currentLocation.memory_usage_ppm }
                                    />
                                </ListItem>
                            </List>
                        </Grid> 
                        <Grid item >
                            <List dense={true}>
                                <ListItem>
                                    <ListItemIcon>
                                        <SelectAllIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="CPU usage"
                                        secondary={ currentLocation.cpu_usage_ppm }
                                    />
                                </ListItem>
                            </List>
                        </Grid>                                                                                     
                        <Grid item xs={12} md={12}>
                          <Divider />
                        </Grid>                                                          
                </Grid>
                </Paper>
            </Container>
        </main>
        </div>
    );
}

export default ClusterDetails;
