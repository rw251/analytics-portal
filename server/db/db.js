var mysql = require('mysql'),
 config = require('../config.js');

var state = {
  pool: null
};

exports.connect = function(done) {
  state.pool = mysql.createPool(config.mysql);

  done();
};

exports.get = function() {
  return state.pool;
};
