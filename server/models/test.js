var db = require('../db/db.js');

exports.get = function(done) {
  db.get().query('SELECT name, count(*) as UsersPerPrescription FROM prescription GROUP BY name ORDER BY count(*) desc LIMIT 10', function (err, rows) {
    if (err) return done(err);
    done(null, rows);
  });
};
