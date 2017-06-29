// whereabouts.js
var mongoose = require('mongoose');

// define the WhereaboutsSchema for mongoose
var WhereaboutSchema = mongoose.Schema({
  name: String,
  position: [Number],
  tm: Date
});

exports.WhereaboutSchema = WhereaboutsSchema;
