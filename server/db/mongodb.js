var mongoose = require('mongoose'),
  config = require('../config.js');

var state = {
  mode: null,
  debug: false
};

var PRODUCTION_URI = config.mongo.url,
  TEST_URI = 'mongodb://127.0.0.1:27017/test';

exports.MODE_TEST = 'mode_test';
exports.MODE_PRODUCTION = 'mode_production';

exports.enableDebug = function() {
  state.debug = true;
};

exports.isDebug = function() {
  return state.debug;
};

exports.connect = function(mode, done) {
  if (mongoose.connection.readyState) return done(null);

  var uri = mode === exports.MODE_TEST ? TEST_URI : PRODUCTION_URI;
  state.mode = mode;

  if (state.debug) mongoose.set('debug', true);

  mongoose.connect(uri);

  var db = mongoose.connection;
  db.on('error', function(err) {
    console.error('mongo connection error');
    return done ? done(err) : null;
  });
  db.once('open', function() {
    // we're connected!
    console.log('mongo connected');
    return done ? done(null) : null;
  });

};

exports.drop = function(done) {
  mongoose.connection.db.dropDatabase(function(){
    return done();
  });
};

exports.fixtures = function(data, done) {
  var db = mongoose.connection.db;
  if (!db) {
    return done(new Error('Missing database connection.'));
  }

  var names = Object.keys(data.collections);

  db.createCollection(names[0], function(err, collection) {
    if (err) return done(err);
    collection.insert(data.collections[names[0]], done);
  });

};
