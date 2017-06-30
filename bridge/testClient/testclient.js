function Client(io,util) {
  const setTimeoutPromise = util.promisify(setTimeout);

  this.start = () => {
    var that = this;
    setTimeout(() => {
      // value === 'foobar' (passing values is optional)
      // This is executed after about 40 milliseconds.
      console.log('time tripped');
      io.emit('clientwhereabouts', { "name": 'timedClient@gmail.com', "position":[ 41.0662516,-74.1727549, 0], "MyDate":"@1269388885866@" });
      that.start();
    }, 1000);

  };


}

//Export the Client constructor
exports.Client = Client;
exports.Client.start = Client.start;
