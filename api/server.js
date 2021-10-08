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

app.use(express.json())
app.use(cors())
app.use(fileupload({debug:false}));

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// Method to set salt and hash the password for a user 
function createPassword(password) { 
     
  // Creating a unique salt for a particular user 
  const salt = crypto.randomBytes(16).toString('hex'); 
   
  // Hashing user's salt and password with 1000 iterations, 
  const hash = crypto.pbkdf2Sync(password, salt,  
  1000, 64, `sha512`).toString(`hex`); 

  return {hash : hash, salt : salt}

};

// setup DB connection
MongoClient.connect(process.env.MONGODB_CONNECTION_STRING)
  .then(client => {

    const db = client.db(process.env.MONGODB_DATABASE)
    const pcConfigCollection = db.collection('pc_config')
    
    app.get('/api/v1/', (req, res) => {
    
        res.status(200).send(JSON.stringify({"version" : "v1"}));
    
    });

    /* PC config SECTION */

    /* GET section */
    app.get('/api/v1/pc',autenticateToken, (req, res) => {
      db.collection('pc_config').find({},{fields: {credentials : 0}}).toArray()
      .then(results => {
        console.log(results)
        res.send(JSON.stringify(results));
      })
      .catch(error => {
        console.error(error)
        res.sendStatus(501)
      })
    });
    
    app.get('/api/v1/pc/id/:id', autenticateToken, (req, res) => {
      if(req.params.id.length === 24){
        db.collection('pc_config').findOne({_id : ObjectID.createFromHexString(req.params.id)})
        .then(results => {
          if(results){
            res.send(JSON.stringify(results));
          }else {
            res.status(404).send(JSON.stringify({"Error" : "Resource not found"}));
          }
        })
        .catch(error => {
          console.error(error)
          res.sendStatus(500)
        })
      }
      else {
        res.status(400).send(JSON.stringify({"Error" : "Bad ID"}));
      }
    });

    /* DELETE section */

    app.delete("/api/v1/pc/id/:id", autenticateToken, (req, res) => {
      if(req.params.id.length === 24){
        db.collection('pc_config').deleteOne({_id : ObjectID.createFromHexString(req.params.id)})
        .then(results => {
          if(results){
            res.status(200).send(JSON.stringify({
              success: "true",
              message: "PC deleted"}));
          }else {
            res.status(404).send(JSON.stringify({"Error" : "Resource not found"}));
          }
        })
        .catch(error => {
          console.error(error)
          res.sendStatus(500)
        })
      }
      else {
        res.status(400).send(JSON.stringify({"Error" : "Bad ID"}));
      }      

    });
    
    /* POST section */

    app.post("/api/v1/pc", autenticateToken, (req, res) => {
      console.log(req.body)

      if (!req.body.pc_name) {
        return res.status(400).send({
          "Error" : "PC name is required",
        });
      } else if (!req.body.pc_url) {
        return res.status(400).send({
          "Error" : "PC URL is required",
        });
      } else if(!req.body.username) {
        return res.status(400).send({
          "Error" : "Username is required",
        });
      }else if(!req.body.password) {
        return res.status(400).send({
          "Error" : "Password is required",
        });
      }

      // Convert credentials for NTNX
      // Create buffer object, specifying utf-8 as encoding
      let bufferObj = Buffer.from(req.body.username+":"+req.body.password, "utf-8");
      // Encode the Buffer as a base64 string
      let base64String = bufferObj.toString("base64");

      // Create document for the database
      const pc_config = {
        pc_url: req.body.pc_url,
        pc_name:  req.body.pc_name,
        credentials: base64String,
        long: req.body.long,
        lat: req.body.lat,
        pc_last_crawled: 000000,
        pc_last_successfull_crawl:000000,
        pc_last_crawled_status: 'None - Not crawled yet'
      };

      db.collection('pc_config').insertOne(pc_config)
      .then(results => {
        console.log(results);
        res.status(201).send({
          success: "true",
          message: "PC added successfully"
        })
      })
      .catch(error => {
        console.error(error)
        res.sendStatus(501)        
      })
    });
    
    /* SITES SECTION */
    app.get('/api/v1/sites', autenticateToken, (req, res) => {
        db.collection('pe_clusters').find().toArray()
        .then(results => {
          console.log(results)
          res.send(JSON.stringify(results));
        })
        .catch(error => {
          console.error(error)
          res.sendStatus(501)
        })
    });

    app.get('/api/v1/sites/id/:id', autenticateToken, (req, res) => {
      if(req.params.id.length === 24){
        db.collection('pe_clusters').findOne({_id : ObjectID.createFromHexString(req.params.id)})
        .then(results => {
          if(results){
            res.send(JSON.stringify(results));
          }else {
            res.status(404).send(JSON.stringify({"Error" : "Resource not found"}));
          }
        })
        .catch(error => {
          console.error(error)
          res.sendStatus(500)
        })
      }
      else {
        res.status(400).send(JSON.stringify({"Error" : "Bad ID"}));
      }
    });     
    
    app.get('/api/v1/sites/uuid/:uuid',autenticateToken, (req, res) => {

      db.collection('pe_clusters').findOne({uuid : req.params.uuid})
      .then(results => {
        if(results){
          res.send(JSON.stringify(results));
        }else {
          res.sendStatus(404)
        }
      })
      .catch(error => {
        console.error(error)
        res.sendStatus(500)
      })
    });
    
    /* Update LAT and LONG */
    app.put('/api/v1/sites/id/:id',autenticateToken, (req, res) => {

      if(!req.body.lat){
        return res.status(400).send({
          "Error" : "lat is required",
        });
      } else if (!req.body.long) {
        return res.status(400).send({
          "Error" : "long is required",
        });
      }

      db.collection('pe_clusters').updateOne({_id : ObjectID.createFromHexString(req.params.id)},
      {$set:{lat : req.body.lat, long : req.body.long }})
      .then(results => {
        if(results){
          res.status(200).send({
            success: "true",
            message: "PC added successfully"
          });
        }else {
          res.sendStatus(404)
        }
      })
      .catch(error => {
        console.error(error)
        res.sendStatus(500)
      })
    });          


    /* ALERTS SECTION */

    app.get('/api/v1/alerts',autenticateToken, (req, res) => {

      db.collection('alerts').find().toArray()
      .then(results => {
        if(results.length){
          res.send(JSON.stringify(results));
        }else {
          res.sendStatus(404)
        }
      })
      .catch(error => {
        console.error(error)
        res.sendStatus(500)
      })
    });

    app.get('/api/v1/alerts/id/:id',autenticateToken, (req, res) => {
      if(req.params.id.length === 24){
        db.collection('alerts').findOne({_id : ObjectID.createFromHexString(req.params.id)})
        .then(results => {
          if(results){
            res.send(JSON.stringify(results));
          }else {
            res.status(404).send(JSON.stringify({"Error" : "Resource not found"}));
          }
        })
        .catch(error => {
          console.error(error)
          res.sendStatus(500)
        })
      }
      else {
        res.status(400).send(JSON.stringify({"Error" : "Bad ID"}));
      }
    });     
    
    app.get('/api/v1/alerts/cluster_uuid/:uuid',autenticateToken, (req, res) => {

      db.collection('alerts').find({originating_cluster_uuid : req.params.uuid}).toArray()
      .then(results => {

        if(results.length){
          res.send(JSON.stringify(results));
        }else {
          res.sendStatus(404)
        }
        
      })
      .catch(error => {
        console.error(error)
        res.sendStatus(500)
      })
    });
    
    app.get('/api/v1/alerts/alert_uuid/:uuid',autenticateToken, (req, res) => {

      db.collection('alerts').findOne({alert_uuid : req.params.uuid})
      .then(results => {
        if(results){
          res.send(JSON.stringify(results));
        }else {
          res.sendStatus(404)
        }
      })
      .catch(error => {
        console.error(error)
        res.sendStatus(500)
      })
    });

  /* USERS section */

  // GET ALL USERS
  app.get('/api/v1/users',autenticateToken, (req, res) => {
    db.collection('users').find().project({password:0}).toArray()
    .then(results => {
      if(results.length){
        res.send(JSON.stringify(results));
      }else {
        res.sendStatus(404)
      }
    })
    .catch(error => {
      console.error(error)
      res.sendStatus(500)
    })
  });

  // GET USER BY ID
  app.get('/api/v1/users/id/:id',autenticateToken, (req, res) => {
    if(req.params.id.length === 24){
      db.collection('users').findOne({_id : ObjectID.createFromHexString(req.params.id)},{ projection: { password: 0 } })
      .then(results => {
        if(results){
          res.send(JSON.stringify(results));
        }else {
          res.status(404).send(JSON.stringify({"Error" : "Resource not found"}));
        }
      })
      .catch(error => {
        console.error(error)
        res.sendStatus(500)
      })
    }
    else {
      res.status(400).send(JSON.stringify({"Error" : "Bad ID"}));
    }
  });
  
  // DELETE USER
  app.delete("/api/v1/users/id/:id",autenticateToken, (req, res) => {
    if(req.params.id.length === 24){
      db.collection('users').deleteOne({_id : ObjectID.createFromHexString(req.params.id)})
      .then(results => {
        if(results){
          res.status(200).send(JSON.stringify({
            success: "true",
            message: "user deleted"}));
        }else {
          res.status(404).send(JSON.stringify({"Error" : "Resource not found"}));
        }
      })
      .catch(error => {
        console.error(error)
        res.sendStatus(500)
      })
    }
    else {
      res.status(400).send(JSON.stringify({"Error" : "Bad ID"}));
    }      
  });

  // ADD USER
  app.post("/api/v1/users",autenticateToken ,(req, res) => {
    console.log(req.body)
    
    if(!req.body.username) {
      return res.status(400).send({
        "Error" : "Username is required",
      });
    }else if(!req.body.password) {
      return res.status(400).send({
        "Error" : "Password is required",
      });
    }

    // Create document for the database

    const tempPass = createPassword(req.body.password)

    const user = {
      username: req.body.username,
      password:  tempPass.hash,
      salt: tempPass.salt,
      note: req.body.note
    };

    db.collection('users').insertOne(user)
    .then(results => {
      console.log(results);
      res.status(201).send({
        success: "true",
        message: "user added successfully"
      })
    })
    .catch(error => {
      console.error(error)
      res.sendStatus(501)        
    })
  });

})

// Socket.io
io.on('connection', function (socket) {
  socket.emit("status", "Connected to backend");
});


// Auth middleware

function autenticateToken(req, res, next){
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] //Check exsistance of header
  if(token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  });
}


server.listen(process.env.API_PORT);
console.log(process.env.API_PORT + ' is the magic port');