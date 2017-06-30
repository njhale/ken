function Client(io,util) {
  const setTimeoutPromise = util.promisify(setTimeout);

  this.start = () => {
    var that = this;
    setTimeoutPromise(1000, 'foobar').then((value) => {
      // value === 'foobar' (passing values is optional)
      // This is executed after about 40 milliseconds.
      console.log('time tripped');
      io.emit('clientwhereabouts', { "name": 'timedClient@gmail.com', "position":[ 0, 0, 0], "MyDate":"@1269388885866@" });
      that.start();
    });
  };


}

//Export the Client constructor
exports.Client = Client;
exports.Client.start = Client.start;
