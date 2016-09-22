var express = require('express');
var router = express.Router();
var cp = require('../passport/change-password');
var rp = require('../passport/reset-password');
var test = require('../models/test.js');
var queries = require('../db/queries.js');
var users = require('../controllers/users.js');

var isAuthenticated = function(req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated())
    return next();
  // if the user is not authenticated then redirect him to the login page
  res.redirect('/login');
};

var isAdmin = function(req, res, next) {
  if (req.user.roles.indexOf("admin") > -1) return next();
  res.redirect('/login');
};

module.exports = function(passport) {

  /* GET login page. */
  router.get('/login', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('pages/login.jade', { message: req.flash() });
  });

  /* Handle Login POST */
  router.post('/login', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));

  /* GET Change password Page */
  router.get('/changepassword', isAuthenticated, function(req, res) {
    res.render('pages/changepassword.jade', { message: req.flash() });
  });

  /* Handle Change password POST */
  router.post('/changepassword', isAuthenticated, cp, function(req, res) {
    res.render('pages/changepassword.jade', { message: req.flash() });
  });

  /* Handle Logout */
  router.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });

  /* USER ADMIN */
  router.get('/admin', isAuthenticated, isAdmin, function(req, res) {
    users.list(function(err, users) {
      res.render('pages/userlist.jade', { users: users, message: req.flash() });
    });
  });

  router.get('/adduser', isAuthenticated, isAdmin, function(req, res) {
    res.render('pages/useradd.jade', { message: req.flash() });
  });

  router.post('/adduser', isAuthenticated, isAdmin, function(req, res) {
    users.add(req, function(err, user, flash) {
      res.render('pages/useradd.jade', { users: users, message: req.flash() });
    });
  });

  router.get('/delete/:email', isAuthenticated, isAdmin, function(req, res) {
    res.render('pages/userdelete.jade', { email: req.params.email });
  });

  router.post('/delete/:email', isAuthenticated, isAdmin, function(req, res) {
    users.delete(req.params.email, function(err, user, flash) {
      res.redirect('/admin');
    });
  });

  router.get('/edit/:email', isAuthenticated, isAdmin, function(req, res) {
    users.get(req.params.email, function(err, user) {
      res.render('pages/useredit.jade', { user: user });
    });
  });

  router.post('/edit/:email', isAuthenticated, isAdmin, function(req, res) {
    users.edit(req.params.email, req, function(err, user, flash) {
      console.log("E:" + err);
      console.log("U:" + user);
      res.redirect('/admin');
    });
  });

  /* api */
  router.get('/api/summary', isAuthenticated, function(req, res){
    queries.summary.all(function(err, val){
      if(err) throw err;
      res.send(val);
    });
  });

  router.get('/api/top10', function(req, res){
    res.send(Object.keys(queries.top10));
  });

  router.get('/api/top10/:category', isAuthenticated, function(req, res){
    queries.top10[req.params.category](function(err, val){
      res.send(val);
    });
  });

  router.get('/api/distribution', function(req, res){
    res.send(Object.keys(queries.distribution));
  });

  router.get('/api/distribution/:category', isAuthenticated, function(req, res){
    queries.distribution[req.params.category](function(err, val){
      res.send(val);
    });
  });

  router.get('/api/diagnoses', isAuthenticated, function(req, res){
    queries.diagnoses(function(err, val){
      if(err) throw err;
      res.send(val);
    });
  });

  router.get('/api/occupations', isAuthenticated, function(req, res){
    queries.occupations(function(err, val){
      if(err) throw err;
      res.send(val);
    });
  });

  /* Ensure all html/js resources are only accessible if authenticated */
  router.get(/^\/(.*html|.*js|)$/, isAuthenticated, function(req, res, next) {
    next();
  });

  return router;
};
