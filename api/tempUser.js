
// simple scipt to create a hashed and salted password. Can be used to create users manually.

const crypto = require('crypto');

// Method to set salt and hash the password for a user 
function createPassword(password) { 
     
    // Creating a unique salt for a particular user 
    const salt = crypto.randomBytes(16).toString('hex'); 
     
    // Hashing user's salt and password with 1000 iterations, 
    const hash = crypto.pbkdf2Sync(password, salt,  
    1000, 64, `sha512`).toString(`hex`); 
  
    return {username: "admin", hash : hash, salt : salt}
  
  };

console.log(JSON.stringify(
  createPassword("admin")))