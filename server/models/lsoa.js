var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var LsoaSchema = new Schema({
  lsoa: {
    type: String,
    required: true
  },
  coords: [{ lat : Number, lng : Number }]
});

module.exports = mongoose.model('Lsoa', LsoaSchema);
