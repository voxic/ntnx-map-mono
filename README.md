# Nutanix World map

### Application that gives you a overview of all your Prism Central deployments.
!["Screenshot"](readme-assets/map.png)

## Overview

The application consists of four main parts
 * Front-end
 * REST-api
 * Crawler
 * MongoDB

!["Overview picture"](readme-assets/overview.png)

## Front-end
THe frontend is written in React, it communicates with the REST-api.

### Map
The map will let the user get a quick overview over the whole environtment.
If the user clicks one of the location, more details are shown. On hover, a line will be drawn to show if there are configured DR locations.
!["Map demo"](readme-assets/MapOverview.gif)

### Cluster list
The cluster list gives a quick overview of all monitored clusters and their status
!["Cluster list"](readme-assets/clusterlist.png)

### Prism Central configuration
From the UI the user can configure Prism Centrals to monitor
!["Prism configuration"](readme-assets/pcConfig.png)

### Location configuration
Locations needs to be configured with an Longitude and a Latitude before they can be shown on the Map
!["Prism configuration"](readme-assets/updateLoc.gif)

### Users
Access to the system is limited to registerd users and/or LDAP configured access.
The system will firs check against local users and then external (LDAP) users.
!["User config"](readme-assets/users.png)