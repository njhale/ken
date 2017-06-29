// whereabouts.js
var mongoose = require('mongoose');

// define the WhereaboutsSchema for mongoose
var WhereaboutsSchema = mongoose.Schema({
  name: String,
  imageUrl: String,
  tm: Number
});

exports.WhereaboutsSchema = WhereaboutsSchema;
