/*******************
* REQUIRED MODULES *
*******************/
var express = require('express');
var http = require('http');
var app = express();
//var proxy = require('express-http-proxy');
var url = require('url');

var server = http.createServer(app);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/**************************************************
* REGISTER PORT 8080 FOR APPLICATION TO LISTEN ON *
**************************************************/
server.listen(8080, function () {
  console.log('App listening on port 8080!');
});

/*******************************************************************
* ACQUIRE ENVIRONMENT VARIABLES FOR HOST:PORT TO PROXY REQUESTS TO *
*******************************************************************/


/****************************************************************
* REGISTER DIRECTORY CONTENT TO BE VIEWED BY APP AS / DIRECTORY *
****************************************************************/

//dist folder that typescript compiles to
app.use(express.static(__dirname + '/dist'));

/**********
* ROUTING *
**********/

/**
* Redirect pages used by the frontend to index.html for everything else
*/
app.get('*', function(req, res) {
  res.sendFile(__dirname + "/dist/index.html");
});
