var express = require('express');
var router = express.Router();
var test = require('../models/test.js');

module.exports = function() {

  /* api */

  router.get('/api/get', function(req, res){
    test.get(function(err,val){
      if(err) throw err;
      res.send(val);
    });
  });



  /* Ensure all html/js resources are only accessible if authenticated */
  router.get(/^\/(.*html|.*js|)$/, function(req, res, next) {
    next();
  });

  return router;
};
