const express = require('express');
const cp = require('../passport/change-password');
const queries = require('../db/queries.js');
const users = require('../controllers/users.js');
const permissions = require('../db/permissions.js');
const lookup = require('../controllers/lookup.js');

const router = express.Router();

const isAuthenticated = function isAuthenticated(req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated()) {
    next();
  } else {
    // if the user is not authenticated then redirect him to the login page
    req.session.redirect_to = req.path; // remember the page they tried to load
    res.redirect('/login');
  }
};

const isAdmin = function isAdmin(req, res, next) {
  if (req.user.roles.indexOf('admin') > -1) {
    next();
  } else {
    res.redirect('/login');
  }
};

module.exports = function index(passport) {
  /* GET login page. */
  router.get('/login', (req, res) => {
    // Display the Login page with any flash message, if any
    res.render('pages/login.jade', { message: req.flash() });
  });

  /* Handle Login POST */
  router.post('/login', passport.authenticate('login', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    let red = req.session.redirect_to || '/';
    if (red === '/') red = '/portal';
    if (req.body.hash) red += `#${req.body.hash}`;
    req.session.redirect_to = null;
    delete req.session.redirect_to;
    res.redirect(red);
  });

  /* GET Change password Page */
  router.get('/changepassword', isAuthenticated, (req, res) => {
    res.render('pages/changepassword.jade', { message: req.flash() });
  });

  /* Handle Change password POST */
  router.post('/changepassword', isAuthenticated, cp, (req, res) => {
    res.render('pages/changepassword.jade', { message: req.flash() });
  });

  /* Handle Logout */
  router.get('/signout', (req, res) => {
    req.logout();
    res.redirect('/login');
  });

  /* USER ADMIN */
  router.get('/admin', isAuthenticated, isAdmin, (req, res) => {
    users.list((err, userList) => {
      res.render('pages/userlist.jade', { users: userList, message: req.flash() });
    });
  });

  router.get('/adduser', isAuthenticated, isAdmin, (req, res) => {
    queries.sites((err, listOfSites) => {
      res.render('pages/useradd.jade', { sites: listOfSites, message: req.flash() });
    });
  });

  router.post('/adduser', isAuthenticated, isAdmin, (req, res) => {
    queries.sites((err1, listOfSites) => {
      users.add(req, (err2, user, flash) => {
        if (err2 || flash) {
          res.render('pages/useradd.jade', { sites: listOfSites, message: req.flash() });
        } else {
          res.redirect('/admin');
        }
      });
    });
  });

  router.get('/delete/:email', isAuthenticated, isAdmin, (req, res) => {
    res.render('pages/userdelete.jade', { email: req.params.email });
  });

  router.post('/delete/:email', isAuthenticated, isAdmin, (req, res) => {
    users.delete(req.params.email, () => {
      res.redirect('/admin');
    });
  });

  router.get('/edit/:email', isAuthenticated, isAdmin, (req, res) => {
    queries.sites((err1, listOfSites) => {
      users.get(req.params.email, (err2, user) => {
        res.render('pages/useredit.jade', { sites: listOfSites, user });
      });
    });
  });

  router.post('/edit/:email', isAuthenticated, isAdmin, (req, res) => {
    users.edit(req.params.email, req, (err, user1, msg) => {
      if (err || msg) {
        queries.sites((err1, listOfSites) => {
          users.get(req.params.email, (err2, user) => {
            res.render('pages/useredit.jade', { sites: listOfSites, user, message: { error: msg } });
          });
        });
      } else {
        res.redirect('/admin');
      }
    });
  });

  router.get('/config', isAuthenticated, isAdmin, (req, res) => {
    res.render('pages/config.jade', { lookup: lookup.cache() });
  });

  router.post('/config', isAuthenticated, isAdmin, (req, res) => {
    lookup.addGroup(req.body.name, () => {
      res.render('pages/config.jade', { lookup: lookup.cache() });
    });
  });

  router.post('/config/:name', isAuthenticated, isAdmin, (req, res) => {
    lookup.updateGroup(req.params.name, req.body.newtext, () => {
      // res.render('pages/config.jade', { lookup: lookup.cache() });
      res.redirect('/config');
    });
  });

  /* api */

  router.get('/api/lastupdated', isAuthenticated, (req, res) => {
    queries.summary.last_updated((err, dt) => {
      res.send(dt);
    });
  });

  router.get('/api/sidebar', isAuthenticated, (req, res) => {
    res.send(permissions.sidebar.roles[req.user.roles[0]]);
  });

  router.get('/api/summary', isAuthenticated, (req, res) => {
    queries.summary.all(req.user, (err, val) => {
      // if(err) throw err;
      res.send(val);
    });
  });

  router.get('/api/summaryparallel', isAuthenticated, (req, res) => {
    queries.summary.allParallel(req.user, (err, val) => {
      // if(err) throw err;
      res.send(val);
    });
  });

  router.get('/api/locations', isAuthenticated, (req, res) => {
    queries.locations.all(req.user, (err, val) => {
      res.send(val);
    });
  });

  router.get('/api/top10', (req, res) => {
    res.send(Object.keys(queries.top10));
  });

  router.get('/api/top10/:category', isAuthenticated, (req, res) => {
    queries.top10[req.params.category](req.user, (err, val) => {
      res.send(val);
    });
  });

  router.get('/api/distribution', (req, res) => {
    res.send(Object.keys(queries.distribution));
  });

  router.get('/api/test/:method', isAuthenticated, (req, res) => {
    queries.test(req.user, req.params.method, (err, val) => {
      res.send(val);
    });
  });

  router.get('/api/distribution/:category', isAuthenticated, (req, res) => {
    queries.distribution[req.params.category](req.user, (err, val) => {
      res.send(val);
    });
  });

  router.get('/api/diagnoses', isAuthenticated, (req, res) => {
    queries.diagnoses((err, val) => {
      if (err) throw err;
      res.send(val);
    });
  });

  router.get('/api/occupations', isAuthenticated, (req, res) => {
    queries.occupations((err, val) => {
      if (err) throw err;
      res.send(val);
    });
  });

  router.get('/api/model', isAuthenticated, (req, res, next) => {
    queries.model.defaultValues(req.user, (err, val) => {
      if (err) next(err);
      else res.send(val);
    });
  });

  router.post('/api/model', isAuthenticated, (req, res, next) => {
    queries.model.averageCompliance(req.user, req.body, (err, val) => {
      if (err) next(err);
      else res.send(val);
    });
  });

  router.get('/', isAuthenticated, (req, res) => {
    res.render('pages/index.jade', { admin: req.user.roles.indexOf('admin') > -1, fullname: req.user.fullname });
  });

  router.get('/portal', isAuthenticated, (req, res) => {
    res.render('pages/portal.jade', { isPortal: true, admin: req.user.roles.indexOf('admin') > -1, menuItems: permissions.sidebar.roles[req.user.roles[0]], fullname: req.user.fullname });
  });

  /* Ensure all html/js resources are only accessible if authenticated */
  router.get(/^\/(.*html|.*js|)$/, isAuthenticated, (req, res, next) => {
    next();
  });

  return router;
};
