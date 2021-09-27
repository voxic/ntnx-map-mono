import React from 'react'
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowIcon from '@material-ui/icons/ArrowForward';

const useStyles = makeStyles((theme) => ({
    paper: {
      minWidth: "100%",
      margin: `${theme.spacing(1)}px auto`,
      padding: theme.spacing(2),
    },
  }));


export default function ClusterStatusCard({title, number, color}) {
    const classes = useStyles();

    return (
    <Paper className={classes.paper}>
        <Grid container wrap="nowrap" spacing={2} justify="space-around" alignItems="center">
        <Grid item>
            <Avatar style={{ backgroundColor: color, color: '#363636'}} onClick={()=>{alert("Hello")}}>{number}</Avatar>
        </Grid>
        <Grid item>
            <Typography noWrap>{title}</Typography>
        </Grid>   
        <Grid item>
            <IconButton size="medium">
                <ArrowIcon fontSize="small"/>
            </IconButton>
        </Grid>         
        </Grid>
    </Paper>
    );
}
