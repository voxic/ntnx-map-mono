import React from 'react'
import ListItem from '@material-ui/core/ListItem';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import UserIcon from '@material-ui/icons/Person';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import MapIcon from '@material-ui/icons/Map';
import SettingsIcon from '@material-ui/icons/Settings';
import BallotIcon from '@material-ui/icons/Ballot';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
import ClusterListIcon from '@material-ui/icons/Dns';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { mainListItems } from './ListItems';
import { Link, useHistory } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
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
  signout: {
    marginLeft : "10px",
    color : ""
  }
}));  

export default function MainMenu({title}) {

    const history = useHistory();
    const classes = useStyles();

    const { currentUser } = useAuth();


    const [openNestedList, setOpenNestedList] = React.useState(false);
    const [open, setOpen] = React.useState(true);

    const handleClickNestedList = () => {
        setOpenNestedList(!openNestedList);
    };

    const handleDrawerOpen = () => {
      setOpen(true);
    };
    const handleDrawerClose = () => {
      setOpen(false);
    };

    return (
    < >
    <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            {title}
          </Typography>
            <Avatar></Avatar><Typography style={{"marginLeft" : "5px"}} variant="h6" component="h6">{currentUser.username}</Typography>
            <div className={classes.signout}>
              <Link onClick={()=> { history.push('/logout')}}>Sign out</Link>
            </div>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
        <ListItem button onClick={()=> { history.push('/') }}>
          <ListItemIcon>
            <MapIcon />
          </ListItemIcon>
          <ListItemText primary="Map" />
        </ListItem>
        <ListItem button onClick={()=> { history.push('/clusterlist/') }}>
          <ListItemIcon>
            <ClusterListIcon />
          </ListItemIcon>
          <ListItemText primary="Cluster list" />
        </ListItem>        
        <ListItem button onClick={handleClickNestedList}>
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary="Configuration" />
        {openNestedList ? <ExpandLess /> : <ExpandMore />}
      </ListItem>        
        <Collapse in={openNestedList} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button className={classes.nested} button onClick={()=> { history.push('/prismcentral') }}>
                  <ListItemIcon>
                    <BallotIcon />
                  </ListItemIcon>
                  <ListItemText primary="Prism Central" />
                </ListItem>
                <ListItem button className={classes.nested} onClick={()=> { history.push('/locations') }} >
                  <ListItemIcon>
                    <LayersIcon />
                  </ListItemIcon>
                  <ListItemText primary="Locations" />
                </ListItem>
                <ListItem button className={classes.nested} onClick={()=> { history.push('/users') }} >
                  <ListItemIcon>
                    <UserIcon />
                  </ListItemIcon>
                  <ListItemText primary="Users" />
                </ListItem>                                  
              </List>
            </Collapse>  
            </List>
      </Drawer>
    </>      
    )
}
