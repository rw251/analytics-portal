var express = require('express');
var router = express.Router();
var test = require('../models/test.js');
var queries = require('../db/queries.js');

module.exports = function() {

  /* api */

  router.get('/api/get', function(req, res){
    test.get(function(err,val){
      if(err) throw err;
      res.send(val);
    });
  });

  router.get('/api/top10', function(req, res){
    res.send(Object.keys(queries.top10));
  });

  router.get('/api/top10/:category', function(req, res){
    queries.top10[req.params.category](function(err, val){
      res.send(val);
    });
  });

  router.get('/api/distribution', function(req, res){
    res.send(Object.keys(queries.distribution));
  });

  router.get('/api/distribution/:category', function(req, res){
    queries.distribution[req.params.category](function(err, val){
      res.send(val);
    });
  });

  router.get('/api/diagnoses', function(req, res){
    queries.diagnoses(function(err, val){
      if(err) throw err;
      res.send(val);
    });
  });

  router.get('/api/occupations', function(req, res){
    queries.occupations(function(err, val){
      if(err) throw err;
      res.send(val);
    });
  });

  router.get('/api/diagnoses', function(req, res){

  });

  /* Ensure all html/js resources are only accessible if authenticated */
  router.get(/^\/(.*html|.*js|)$/, function(req, res, next) {
    next();
  });

  return router;
};
