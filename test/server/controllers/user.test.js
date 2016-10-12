var expect = require("chai").expect,
  DB = require('../../../server/db/mongodb'),
  exampleUsers = require('../fixtures/model-users'),
  async = require('async');

var users = require('../../../server/controllers/users');
var User = require('../../../server/models/user');

describe('User Tests', function() {

  before(function(done) {
    DB.connect(DB.MODE_TEST, function(){
      DB.drop(function(err) {
        if (err) return done(err);
        async.each(exampleUsers, function(v, cb){
          var newUser = new User({
            email: v.email,
            password: v.password,
            fullname: v.fullname,
            roles: v.roles || []
          });
          newUser.save(cb);
        }, done);
      });
    });
  });

  it("Gets existing user", function(done) {
    users.get(exampleUsers[0].email, function(err, user){
      expect(user.fullname).to.equal(exampleUsers[0].fullname);
      done();
    });
  });

  it("Returns false for unknown user", function(done) {
    users.get('UNKNOWN', function(err, user){
      expect(user).to.equal(false);
      done();
    });
  });

  it("Lists all users", function(done){
    users.list(function(err,list){
      expect(list.length).to.equal(4);
      done();
    });
  });

  it("Deletes a user", function(done){
    users.delete(exampleUsers[3].email, function(err){
      users.get(exampleUsers[3].email,function(err, user){
        expect(user).to.equal(false);
        done();
      });
    });
  });

  it("Edits a user", function(done){
    var u = exampleUsers[0];
    users.edit(u.email, {body:{isMujo:true,sites:["1|site1"],email:u.email,fullname:u.fullname}}, function(err,user){
      console.log(err);
      expect(user.roles.indexOf('mujo')).to.equal(0);
      done();
    });
  });

  it("Edits a user - changes email address to non-existing", function(done){
    var u = exampleUsers[0], newEmail ='unused@me.com';
    users.edit(u.email, {body:{isMujo:true,sites:["1|site1"],email:newEmail,fullname:u.fullname}}, function(err,user){
      console.log(err);
      expect(user.roles.indexOf('mujo')).to.equal(0);
      expect(user.email).to.equal(newEmail);
      done();
    });
  });

  it("Edits a user - changes email address to existing", function(done){
    var u = exampleUsers[2], existingEmail = exampleUsers[1].email;
    users.edit(u.email, {body:{isMujo:true,sites:["1|site1"],email:existingEmail,fullname:u.fullname}}, function(err,user){
      expect(user).to.equal(false);
      done();
    });
  });

  it("Add a user", function(done){
    var u = {isMujo:true,sites:["1|site1"],email:'new@email.com',fullname:'new person',password:'asdf'};
    users.add({body:u}, function(err,user){
      expect(user.fullname ).to.equal( u.fullname);
      expect(user.email ).to.equal( u.email);
      expect(user.roles.indexOf('mujo')).to.equal(0);
      expect(user.roles.indexOf('admin')).to.equal(-1);
      done();
    });
  });

});
