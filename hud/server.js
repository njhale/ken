/*******************
* REQUIRED MODULES *
*******************/
var express = require('express');
var http = require('http');
var app = express();
//var proxy = require('express-http-proxy');
var url = require('url');


var server = http.createServer(app);

var io = require('socket.io')(server);

var ioCli = require('socket.io-client')('https://ken.ocp.nhale.org', {rejectUnauthorized: false});

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
// setInterval(() => {
//   console.log('I\'m emitting now!');
//   ioCli.emit('whereabouts',
//     { "name": 'krang', "position":[ 41.0662516,-74.1727549, 0], "tm": new Date() });
//   console.log('I\'ve emitted');
// }, 5000);

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

io.on('connection', (socket) => {
  console.log(`connection confirmed from ${socket.id}`);

  socket.on('whereabouts', (msg) => {
    //console.log('hello?');
    //console.log(`whereabout received: ${JSON.stringify(msg)}`);
    io.emit('whereabouts', msg);
  });

});
