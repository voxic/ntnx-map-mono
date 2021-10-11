// Initialize
require('dotenv').config()
var ActiveDirectory = require('activedirectory');
var config = {
    url: process.env.LDAP_URL,
    baseDN: process.env.BASE_DN
};
var ad = new ActiveDirectory(config);
var username = 'ka@local.loc';
var password = 'nutanix/4u';
// Authenticate
ad.authenticate(username, password, function(err, auth) {
    if (err) {
        console.log('ERROR: '+JSON.stringify(err));
        return;
    }
    if (auth) {
        console.log('Authenticated!');
    }
    else {
        console.log('Authentication failed!');
    }
});