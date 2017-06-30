var app = require("express")();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const util = require('util');
var client = require('./testClient/testclient.js').Client;



const APP_POD_NAME = process.env.APP_POD_NAME || "[RUNNING LOCALLY]";
const PORT = process.env.BRIDGE_SERVICE_PORT || 8080;
const HOST = process.env.BRIDGE_SERVICE_HOST || 'localhost';
var connections = [];



io.on('connection', (socket) => {
  console.log(`connection confirmed from ${socket.id}`);
  connections[socket.id] = 1;
  // Emit the exit of the connection on socket's disconnect (status 0 == exiting)
  socket.on('disconnect', () => {
    delete connections[socket.id];
  });


  socket.on('whereabouts', (msg) => {
    console.log(`whereabout received: ${msg}`);
    //io.emit('whereabouts', data);
  });

});

setInterval(() => {
  socket.emit('whereabouts', 
    { "name": 'krang', "position":[ 41.0662516,-74.1727549, 0], "tm": new Date() });
}, 5000);

/*
 * -------------------------------------------------------------------------
 * sends out clientwhereabouts every second
 */
// var newClient = new client(io, util);
// newClient.start();
//-------------------------------------------------------------------------




app.get('/trigger', (req, res) => {
  try {
    console.log('register url hit ' + APP_POD_NAME);
    // Return a 200 'OK'
    io.emit('trigger', {
      "name": 'mfalto@gmail.com'
    });
    res.status(200).send(`registration complete ${APP_POD_NAME}`);
  } catch (err) {
    console.log(`Something went wrong while registering a client /: ${err}`);
  }
});


/*
app.get('/whereabouts', (req, res) => {
  try {
    console.log('whereabouts url hit ' + APP_POD_NAME);
    // Return a 200 'OK'
    io.emit('whereabouts', { "name": 'nichhale@gmail.com', "position":[ 0, 0, 0], "MyDate":"@1269388885866@" });
    res.status(200).send(`registration complete ${APP_POD_NAME}`);
  } catch (err) {
    console.log(`Something went wrong while registering a client /: ${err}`);
  }
});
*/


/**
 * Readiness health-check endpoint
 **/
app.get('/', (req, res) => {
  try {
    console.log('root url hit ' + APP_POD_NAME);
    // Return a 200 'OK'
    res.status(200).send(`root url hit ${APP_POD_NAME}`);
  } catch (err) {
    console.log(`Something went wrong while responding to readiness check at /: ${err}`);
  }
});


// Serve the nodejs app on the given port
server.listen(PORT, () => {
  console.log(`nodejs-package-aggregator running @ ${HOST}:${PORT}`);
});
