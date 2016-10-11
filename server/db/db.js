var mysql = require('mysql');

var state = {
  pool: null
};

exports.connect = function(config, done) {
  state.pool = mysql.createPool(config);

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
