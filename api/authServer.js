require('dotenv').config()

// load the things we need
var express = require('express');
var cors = require('cors');
var app = express();
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const fileupload = require('express-fileupload');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 

const ActiveDirectory = require('activedirectory');
var adConfig = {
    url: process.env.LDAP_URL,
    baseDN: process.env.BASE_DN
};
var ad = new ActiveDirectory(adConfig);

app.use(express.json())
app.use(cors())
app.use(fileupload({debug:false}));

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


function checkPassword(obj){
  const hash = crypto.pbkdf2Sync(obj.password,obj.salt, 1000, 64, `sha512`).toString(`hex`); 
  return hash === obj.hash; 
}

function adAuth(username, password, fn){
  ad.authenticate(username, password, function(err, auth) {
    if (err) {
        console.log('ERROR: '+JSON.stringify(err));
        fn(false)
    }
    if (auth) {
        fn(true)
    }
    else {
        fn(false)
    }
  });
}

function dbAuth(db, username, password, fn){

  db.collection('users').findOne({username : username})
        .then(results => {
        if(results){
          const tempObj = {
              hash : results.password,
              salt : results.salt,
              password : password
          }
          if(checkPassword(tempObj)){
            const user = {
              username : results.username
            }
            const accessToken = generateAccessToken(user)
            const refreshToken = generateRefreshToken(user)

            db.collection('refreshTokens').insertOne({"refreshToken" : refreshToken})
            .then(results => {
                fn({status: "success", accessToken : accessToken, refreshToken : refreshToken});
              })
            .catch(error => {
              console.error(error)
              fn({status:501, error : error})      
            })            
          }
          else {
            fn({status:403, error : "Bad password"});
          }

        }else {
          fn({status:403, error : "User not found"});
        }
      })
      .catch(error => {
        console.error(error)
        fn({status : 500})
      })


}

// setup DB connection
MongoClient.connect(process.env.MONGODB_CONNECTION_STRING)
  .then(client => {

    const db = client.db(process.env.MONGODB_DATABASE)
    const pcConfigCollection = db.collection('pc_config')
    
    app.get('/api/v1/', (req, res) => {
    
        res.status(200).send(JSON.stringify({"version" : "v1"}));
    
    });
    
    /* LOGIN section */
    app.post('/api/v1/login', (req, res) => {

      if(!req.body.username){
        res.status(403).send(JSON.stringify({"Error" : "Username required"}));
        return
      }
      if(!req.body.password){
        res.status(403).send(JSON.stringify({"Error" : "Password required"}));
        return
      }      
      //Auth user with LDAP

      if(adConfig.url){
        adAuth(req.body.username, req.body.password, (result)=>{
          if(result){
            // Auth successfull
            adAuthSuccess = true
            const user = {
              username : req.body.username
            }
            const accessToken = generateAccessToken(user)
            const refreshToken = generateRefreshToken(user)

            db.collection('refreshTokens').insertOne({"refreshToken" : refreshToken})
            .then(results => {
                // return token to user
                res.json({accessToken : accessToken, refreshToken : refreshToken});
              })
            .catch(error => {
              console.error(error)
              res.sendStatus(501)        
            })  

          }
          else {
            dbAuth(db, req.body.username, req.body.password, (result) => {
              if(result.status == "success"){
                // Auth seccessfull
                //Return token to user
                res.json({accessToken : result.accessToken, refreshToken : result.refreshToken});
              }
              else {
                res.status(result.status).send(JSON.stringify(result))
              }
            })            
          }
        })
      } else {
        dbAuth(db, req.body.username, req.body.password, (result) => {
          if(result.status == "success"){
            // Auth seccessfull
            //Return token to user
            res.json({accessToken : result.accessToken, refreshToken : result.refreshToken});
          }
          else {
            res.status(result.status).send(JSON.stringify(result))
          }
        })
      }

    })


    // Refresh token
    app.post('/api/v1/refreshtoken', (req, res) => {
      const refreshToken = req.body.refreshToken
      if( refreshToken == null) return res.sendStatus(401)

      db.collection('refreshTokens').findOne({"refreshToken" : refreshToken})
      .then(results => {
        if(results){
          jwt.verify(results.refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403)
            const accessToken = generateAccessToken({ name: user.name })
            res.json({"accessToken" : accessToken})
          });
        } else {
          res.status(403).send(JSON.stringify({"Error" : "Invalid token"}));
        }
      })
      .catch(error => {
        console.error(error)
        res.sendStatus(500)
      })


    })

    // Logout, delete refreshtoken
    app.delete('/api/v1/logout', (req, res) =>{
      const refreshToken = req.body.refreshToken
      if( refreshToken == null) return res.sendStatus(401)
      db.collection('refreshTokens').deleteOne({"refreshToken" : refreshToken})
      .then(results => {
        if(results){
          res.status(200).send(JSON.stringify({
            success: "true",
            message: "refreshToken deleted"}));
        }else {
          res.status(404).send(JSON.stringify({"Error" : "Token not found"}));
        }
      })
      .catch(error => {
        console.error(error)
        res.sendStatus(500)
      })      
    })


  })

function generateAccessToken(user){
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn : '24h'})
}

function generateRefreshToken(user){
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
}


server.listen(process.env.AUTH_PORT);
console.log(process.env.AUTH_PORT + ' is the magic port');