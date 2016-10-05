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
  req.session.redirect_to = req.path; //remember the page they tried to load
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
  router.post('/login', passport.authenticate('login', { failureFlash: true, failureRedirect: '/login' }), function(req, res) {
    var red = req.session.redirect_to || '/';
    if (req.body.hash) red += '#' + req.body.hash;
    req.session.redirect_to = null;
    delete req.session.redirect_to;
    res.redirect(red);
  });

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
    queries.sites(function(err, listOfSites) {
      res.render('pages/useradd.jade', { sites: listOfSites, message: req.flash() });
    });
  });

  router.post('/adduser', isAuthenticated, isAdmin, function(req, res) {
    queries.sites(function(err, listOfSites) {
      users.add(req, function(err, user, flash) {
        if (err || flash) {
          res.render('pages/useradd.jade', { sites: listOfSites, message: req.flash() });
        } else {
          res.redirect('/admin');
        }
      });
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
    queries.sites(function(err, listOfSites) {
      users.get(req.params.email, function(err, user) {
        res.render('pages/useredit.jade', { sites: listOfSites, user: user });
      });
    });
  });

  router.post('/edit/:email', isAuthenticated, isAdmin, function(req, res) {
    users.edit(req.params.email, req, function(err, user, msg) {
      if (err || msg) {
        queries.sites(function(err, listOfSites) {
          users.get(req.params.email, function(err, user) {
            res.render('pages/useredit.jade', { sites: listOfSites, user: user, message: { error: msg } });
          });
        });
      } else {
        res.redirect('/admin');
      }
    });
  });

  /* api */
  router.get('/api/summary', isAuthenticated, function(req, res) {
    queries.summary.all(req.user, function(err, val) {
      //if(err) throw err;
      res.send(val);
    });
  });

  router.get('/api/top10', function(req, res) {
    res.send(Object.keys(queries.top10));
  });

  router.get('/api/top10/:category', isAuthenticated, function(req, res) {
    queries.top10[req.params.category](function(err, val) {
      res.send(val);
    });
  });

  router.get('/api/distribution', function(req, res) {
    res.send(Object.keys(queries.distribution));
  });

  router.get('/api/test/:method', isAuthenticated, function(req,res){
    queries.test(req.user, req.params.method, function(err, val){
      res.send(val);
    });
  });

  router.get('/api/distribution/:category', isAuthenticated, function(req, res) {
    queries.distribution[req.params.category](req.user, function(err, val) {
      res.send(val);
    });
  });

  router.get('/api/diagnoses', isAuthenticated, function(req, res) {
    queries.diagnoses(function(err, val) {
      if (err) throw err;
      res.send(val);
    });
  });

  router.get('/api/occupations', isAuthenticated, function(req, res) {
    queries.occupations(function(err, val) {
      if (err) throw err;
      res.send(val);
    });
  });

  router.get('/', isAuthenticated, function(req, res, next){
    res.render('pages/index.jade', { admin: req.user.roles.indexOf("admin") > -1, fullname: req.user.fullname });
  });

  /* Ensure all html/js resources are only accessible if authenticated */
  router.get(/^\/(.*html|.*js|)$/, isAuthenticated, function(req, res, next) {
    next();
  });

  return router;
};
