var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var LookupSchema = new Schema({
  category: {
    type: String,
    required: true
  },
  lookup: [{ key : String, value : String }]
});

module.exports = mongoose.model('Lookup', LookupSchema);
