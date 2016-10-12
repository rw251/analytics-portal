var mysql = require('mysql');

var state = {
  pool: null
};

var debug = false;

exports.MODE_TEST = 'MODE_TEST';
exports.MODE_PRODUCTION = 'MODE_PRODUCTION';

exports.enableDebug = function() {
  debug = true;
};

exports.isDebug = function() {
  return debug;
};

exports.connect = function(mode, config, done) {
  if(debug) config.debug = ['ComQueryPacket', 'RowDataPacket'];
  //if(mode === exports.MODE_TEST) config=
  state.pool = mysql.createPool(config);

  done();
};

exports.fakeDB = function(done) {
  state.pool = {

    query: function(sql, callback){
      console.log(sql);
      return callback(new Error("NODB"));
    },

    escape:function(value){
      return mysql.escape(value);
    }

  };

  done();
};

exports.get = function() {
  return state.pool;
};
