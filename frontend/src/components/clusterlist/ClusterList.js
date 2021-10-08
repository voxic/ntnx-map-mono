import React from 'react';
import MainMenu from '../MainMenu';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { useClusterData } from '../../contexts/ClusterData'
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import RefreshIcon from '@material-ui/icons/Refresh';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
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
      height: "80vh",
    },
    refreshText: {
        color: 'lightgrey'
    }
  }));



// component to list all clusters/locations
const ClusterList = () => {

    const { locations, fetchLocations, dataRefreshed } = useClusterData(); // Cluster data context

    const history = useHistory();

    // Handle refresh button
    function handleRefresh(){
        fetchLocations();
    }
    
    // Create columns for DataGrid
    const columns = [
        { field: 'id', headerName: 'ID', hide: true},
        { field: 'clusterName', headerName: 'Cluster Name', 
            renderCell : (params) => (
            <Link style={{hover: {cursor: "pointer !important"}}} onClick={()=>{ history.push('/clusterdetails/'+params.value[0]) }}>{params.value[1]}</Link>
        )   , flex: 1 },
        { field: 'pcURL', headerName: 'Prism Central URL', 
            renderCell : (params) => (
                <Link href={params.value}>{params.value}</Link>
            ),  flex: 1},
        {field: 'peURL', headerName: 'Prism Elements URL',             
            renderCell : (params) => (
            <Link href={params.value}>{params.value}</Link>
        ), flex: 1},
        {field: 'status', headerName: 'Status', flex: 1, 
            renderCell : (params) => (
                <Chip label={params.value[0]} style={{backgroundColor : params.value[1]}}/>
            ) },
        {field: 'lastUpdated', headerName: 'Last crawled', flex: 1}
    ];


    // Create rows for DataGrid
    const rows = [];

    locations.map((location) => {
        rows.push({
            id : location._id,
            clusterName : [location._id,location.name],
            pcURL : location.pc_url,
            peURL : 'https://'+ location.network.external_ip +':9440',
            status : [location.status, location.color],
            lastUpdated : String(new Date(location.last_crawled * 1000).toISOString()).replace('T', ' ').replace('Z', '').replace('.000','')
        })
    })

    const classes = useStyles();

    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

    return (
        <div className={classes.root}>
        <CssBaseline />
        <MainMenu title={"Cluster list"} />
        <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth="xl" className={classes.container}>
                <Paper className={fixedHeightPaper}>
                <Grid container spacing={2} >
                    <Grid direction="row" container item justify="space-between" spacing={2}>
                        <Grid item xs={3} md={3}>
                        <Typography variant="h3">List of locations</Typography>
                        </Grid>
                        <Grid item container justify="flex-end" alignItems="center" xs={3} md={3}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                        >
                            Update
                        </Button>
                        </Grid>
                    </Grid>                    
                    <Grid item xs={12} md={12} lg={12}>
                    <div style={{ height: '55vh'}}>
                        <DataGrid rows={rows} columns={columns} autoPageSize={true} components={{Toolbar: GridToolbar}} />
                    </div>
                    <div className={classes.refreshText}>{String(dataRefreshed).replace('T', ' ').replace('Z', '')}</div>
                    </Grid>
                </Grid>
                </Paper>
            </Container>
        </main>
        </div>
    );
}

export default ClusterList;
