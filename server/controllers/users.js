var User = require('../models/user');

module.exports = {

  get: function(email, done) {
    User.findOne({
      'email': email
    }, function(err, user) {
      if (!user) {
        console.log('User doesnt exists with email: ' + email);
        return done(null, false);
      } else {
        done(null, user.toObject());
      }
    });
  },

  list: function(done) {
    User.find({}, null, { sort: { email: 1 } }, function(err, users) {
      if (err) {
        return done(err);
      }
      users = users.map(function(v) {
        return v.toObject();
      });
      return done(null, users);
    });
  },

  delete: function(email, done) {
    User.find({ email: email }).remove(done);
  },

  edit: function(email, req, done) {
    User.findOne({
      'email': email
    }, function(err, user) {
      // In case of any error, return using the done method
      if (err) {
        console.log('Error in SignUp: ' + err);
        return done(err);
      }
      // already exists
      if (!user) {
        console.log('User doesnt exist with email: ' + email);
        return done(null, false, 'Trying to edit a user with an email not found in the system');
      } else {

        var roles = [];
        if (req.body.isAdmin) roles.push("admin");
        var originalUser = user;

        if (email === req.body.email) {
          //email not changing so update is fine
          user.fullname = req.body.fullname;
          user.roles = roles;

          if (req.body.sites) {
            if(typeof(req.body.sites)!=="object") req.body.sites = [req.body.sites];
            user.sites = req.body.sites.map(function(v) {
              var els = v.split("|");
              return { id: els[0], name: els[1] };
            });
          }
          // save the user
          user.save(function(err) {
            if (err) {
              console.log('Error in Saving user: ' + err);
              throw err;
            }
            console.log('User edit succesful');
            return done(null, user);
          });
        } else {
          //check no existing user with that email
          User.findOne({
            'email': req.body.email
          }, function(err, user) {
            // if there is already a user with the modified email address
            if (user) {
              console.log('Trying to change the email to one that already appears in the system: ' + email);
              return done(null, false, 'Trying to change the email to one that already appears in the system.');
            } else {
              originalUser.email = req.body.email;
              originalUser.fullname = req.body.fullname;
              originalUser.roles = roles;
              if (req.body.sites) {
                if(typeof(req.body.sites)!=="object") req.body.sites = [req.body.sites];
                originalUser.sites = req.body.sites.map(function(v) {
                  var els = v.split("|");
                  return { id: els[0], name: els[1] };
                });
              }
              // save the user
              originalUser.save(function(err) {
                if (err) {
                  console.log('Error in Saving user: ' + err);
                  throw err;
                }
                console.log('User edit succesful');
                return done(null, originalUser);
              });
            }
          });
        }
      }
    });
  },

  add: function(req, done) {
    User.findOne({
      'email': req.body.email
    }, function(err, user) {
      // In case of any error, return using the done method
      if (err) {
        console.log('Error in SignUp: ' + err);
        return done(err);
      }
      // already exists
      if (user) {
        console.log('User already exists with email: ' + req.body.email);
        return done(null, false, req.flash('error', 'An account with that email address already exists'));
      } else {
        // if there is no user with that email
        // create the user
        var roles = [];
        if (req.body.isAdmin) roles.push("admin");
        var newUser = new User({
          email: req.body.email,
          password: req.body.password,
          fullname: req.body.fullname,
          roles: roles
        });

        if (req.body.sites) {
          if(typeof(req.body.sites)!=="object") req.body.sites = [req.body.sites];
          newUser.sites = req.body.sites.map(function(v) {
            var els = v.split("|");
            return { id: els[0], name: els[1] };
          });
        }

        // save the user
        newUser.save(function(err) {
          if (err) {
            console.log('Error in Saving user: ' + err);
            throw err;
          }
          console.log('User Registration succesful');
          return done(null, newUser);
        });
      }
    });
  }

};
