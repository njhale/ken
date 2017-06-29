// server.js

// Require appropriate modules
var express = require('express');

// get config object
var config = require('./config');

// Instanciate the app object
var app = express();

// begin listening on configured port
app.listen(config.port, ()=> {
  console.log('Regisrty server running on' + config.port);
});
