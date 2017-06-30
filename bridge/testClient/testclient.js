function Client(io,util) {

  this.start = () => {
    var that = this;
    setTimeout(() => {
      // value === 'foobar' (passing values is optional)
      // This is executed after about 40 milliseconds.
      console.log('time tripped');
      io.emit('whereabouts', { "name": 'krang', "position":[ 41.0662516,-74.1727549, 0], "tm": new Date() });
      that.start();
    }, 1000);

  };


}

//Export the Client constructor
exports.Client = Client;
exports.Client.start = Client.start;
