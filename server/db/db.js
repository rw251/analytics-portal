var mysql = require('mysql'),
 config = require('../config.js');

var state = {
  pool: null
};

exports.connect = function(done) {
  state.pool = mysql.createPool(config.mysql);

  done();
};

exports.fakeDB = function(done) {
  state.pool = {

    query: function(sql, callback){
      console.log(sql);
      return callback(new Error("NODB"));
    }

  };

  done();
};

exports.get = function() {
  return state.pool;
};
