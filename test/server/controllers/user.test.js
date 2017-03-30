let expect = require('chai').expect,
  DB = require('../../../server/db/mongodb'),
  exampleUsers = require('../fixtures/model-users'),
  async = require('async');

const users = require('../../../server/controllers/users');
const User = require('../../../server/models/user');

describe('User Tests', () => {
  before((done) => {
    DB.connect(DB.MODE_TEST, () => {
      DB.drop((err) => {
        if (err) return done(err);
        async.each(exampleUsers, (v, cb) => {
          const newUser = new User({
            email: v.email,
            password: v.password,
            fullname: v.fullname,
            roles: v.roles || [],
          });
          newUser.save(cb);
        }, done);
      });
    });
  });

  it('Gets existing user', (done) => {
    users.get(exampleUsers[0].email, (err, user) => {
      expect(user.fullname).to.equal(exampleUsers[0].fullname);
      done();
    });
  });

  it('Returns false for unknown user', (done) => {
    users.get('UNKNOWN', (err, user) => {
      expect(user).to.equal(false);
      done();
    });
  });

  it('Lists all users', (done) => {
    users.list((err, list) => {
      expect(list.length).to.equal(4);
      done();
    });
  });

  it('Deletes a user', (done) => {
    users.delete(exampleUsers[3].email, (err) => {
      users.get(exampleUsers[3].email, (err, user) => {
        expect(user).to.equal(false);
        done();
      });
    });
  });

  it('Edits a user', (done) => {
    const u = exampleUsers[0];
    users.edit(u.email, { body: { isMujo: true, sites: ['1|site1'], email: u.email, fullname: u.fullname } }, (err, user) => {
      console.log(err);
      expect(user.roles.indexOf('mujo')).to.equal(0);
      done();
    });
  });

  it('Edits a user - changes email address to non-existing', (done) => {
    let u = exampleUsers[0],
      newEmail = 'unused@me.com';
    users.edit(u.email, { body: { isMujo: true, sites: ['1|site1'], email: newEmail, fullname: u.fullname } }, (err, user) => {
      console.log(err);
      expect(user.roles.indexOf('mujo')).to.equal(0);
      expect(user.email).to.equal(newEmail);
      done();
    });
  });

  it('Edits a user - changes email address to existing', (done) => {
    let u = exampleUsers[2],
      existingEmail = exampleUsers[1].email;
    users.edit(u.email, { body: { isMujo: true, sites: ['1|site1'], email: existingEmail, fullname: u.fullname } }, (err, user) => {
      expect(user).to.equal(false);
      done();
    });
  });

  it('Add a user', (done) => {
    const u = { isMujo: true, sites: ['1|site1'], email: 'new@email.com', fullname: 'new person', password: 'asdf' };
    users.add({ body: u }, (err, user) => {
      expect(user.fullname).to.equal(u.fullname);
      expect(user.email).to.equal(u.email);
      expect(user.roles.indexOf('mujo')).to.equal(0);
      expect(user.roles.indexOf('admin')).to.equal(-1);
      done();
    });
  });
});
