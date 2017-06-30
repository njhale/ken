// server.js

// Require appropriate modules
var express = require('express');

// get config object
var config = require('./config');

// Instanciate the app object
var app = express();

const APP_POD_NAME = process.env.APP_POD_NAME || "[RUNNING LOCALLY]"
const PORT = process.env.BRIDGE_SERVICE_PORT || 8081;
const HOST = process.env.BRIDGE_SERVICE_HOST || 'localhost';




// begin listening on configured port
app.listen(PORT, ()=> {
  console.log('Regisrty server running on' + PORT);
});
