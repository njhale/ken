// config.js

//TODO: set config.host

// Require mongoose
var mongoose = require('mongoose');

// Declare empty config object
var config = {};

// Collect app config environment variables
config.port = 8080;
config.host = '';

// Collect related service environments
config.mongoUri = '';
config.mongoFatabase = '';

// Set default user and pass
config.mongoUser = '';
config.mongoPass = '';

// Get relevant secrets from the secrets volume if it exists
try {
  config.mongoUser = fs.readFileSync('/etc/secret-volume/mongo-username');
  config.mongoPass = fs.readFileSync('/etc/secret-volume/mongo-password');
} catch (ex) {
  console.log(`Something went wrong while attempting to access secrets-volume\n${ex}
    \nContinuing...`);
}

// Create URI with mongoddb username and password
config.mongoUri =
  `mongodb://${config.mongoUser}:${config.mongoPass}@${config.mongoUri}/${config.mongoDatabase}`;

// Set options for reconnect
config.mongoOptions = {
  server:
    {
        // sets how many times to try reconnecting
        reconnectTries: Number.MAX_VALUE,
        // sets the delay between every retry (milliseconds)
        reconnectInterval: 1000
    },
    config: { autoIndex: false }
};

// Instanciate the mongoDB
config.db = mongoose.connect(config.mongoUri, config.mongoOptions).connection;
// Define connection error event listener
config.db.on('error', (err) => {
  console.log(`An error occured while interfacing with mongodb: ${err}`);
});
// Define connection open listener
config.db.once('open', () => {
  console.log(console.log(`Mongoose connected to mongodb @ ${config.mongoUri}`));
})
