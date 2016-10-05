var db = require('./db.js'),
  permissions = require('./permissions.js');

var query = {

  summary: {

    all: function(user, done) {
      query.summary.last_updated(function(err, lu) {
        if (err) return done(err);
        query.summary.count.patients(user, function(err, pats) {
          if (err) return done(err);
          query.summary.count.active_patients(user, function(err, act) {
            if (err) return done(err);
            query.summary.count.locations(user, function(err, locs) {
              if (err) return done(err);
              query.summary.count.physios(user, function(err, phys) {
                if (err) return done(err);
                query.summary.count.diagnoses(user, function(err, diags) {
                  if (err) return done(err);
                  return done(null, {
                    "updated": lu,
                    "count": {
                      "allpatients": pats,
                      "activepatients": act,
                      "locations": locs,
                      "physios": phys,
                      "diagnoses": diags
                    }
                  });
                });
              });
            });
          });
        });
      });
    },

    last_updated: function(done) {
      db.get().query('SELECT MAX(startDate) as last_updated FROM exercise_session', function(err, rows) {
        if (err) return done(err);
        done(null, rows[0].last_updated);
      });
    },

    count: {

      patients: function(user, done) {
        var queryString = permissions.numberPatients.query(user);
        console.log(queryString);
        db.get().query(queryString, function(err, rows) {
          if (err) return done(err);
          done(null, permissions.numberPatients.result(rows));
        });
      },

      active_patients: function(user, done) {
        var queryString = permissions.numberActivePatients.query(user);
        console.log(queryString);
        db.get().query(queryString, function(err, rows) {
          if (err) return done(err);
          done(null, permissions.numberActivePatients.result(rows));
        });
      },

      locations: function(user, done) {
        var queryString = permissions.numberLocations.query(user);
        console.log(queryString);
        db.get().query(queryString, function(err, rows) {
          if (err) return done(err);
          done(null, permissions.numberLocations.result(rows));
        });
      },

      diagnoses: function(user, done) {
        var queryString = permissions.numberDiagnoses.query(user);
        console.log(queryString);
        db.get().query(queryString, function(err, rows) {
          if (err) return done(err);
          done(null, permissions.numberDiagnoses.result(rows));
        });
      },

      physios: function(user, done) {
        var queryString = permissions.numberPhysios.query(user);
        console.log(queryString);
        db.get().query(queryString, function(err, rows) {
          if (err) return done(err);
          done(null, permissions.numberPhysios.result(rows));
        });
      },

      prescriptions: function(done) {
        db.get().query('SELECT name FROM prescription GROUP BY name', function(err, rows) {
          if (err) return done(err);
          done(null, rows.length);
        });
      }

    }

  },

  occupations: function(done) {
    db.get().query('SELECT occupation as val, COUNT(*) as num FROM patient_info_copy WHERE occupation is not null GROUP BY occupation', function(err, rows) {
      if (err) return done(err);
      done(null, rows);
    });
  },

  diagnoses: function(done) {
    db.get().query('SELECT diagnosis as val, COUNT(*) as num FROM patient_info_copy WHERE diagnosis is not null AND diagnosis != "" GROUP BY diagnosis', function(err, rows) {
      if (err) return done(err);
      done(null, rows);
    });
  },

  sites: function(done) {
    db.get().query('SELECT id, name FROM site', function(err, rows) {
      if (err) {
        if (err.message === "NODB") return done(null, [{ id: 1, name: "Site A" }, { id: 2, name: "Site B" }, { id: 3, name: "Site C" }, { id: 4, name: "Site D" }]);
        return done(err);
      }
      done(null, rows);
    });
  },

  diagnostic: {

    fieldPercentage: {

      age: function(user, done) {
        var queryString = permissions.percentAgeFields.query(user);
        console.log(queryString);
        db.get().query(queryString, function(err, rows) {
          if (err) return done(err);
          done(null, permissions.percentAgeFields.result(rows));
        });
      },

      diagnosis: function(user, done) {
        var queryString = permissions.percentDiagnosisFields.query(user);
        console.log(queryString);
        db.get().query(queryString, function(err, rows) {
          if (err) return done(err);
          done(null, permissions.percentDiagnosisFields.result(rows));
        });
      },

      occupation: function(user, done) {
        var queryString = permissions.percentOccupationFields.query(user);
        console.log(queryString);
        db.get().query(queryString, function(err, rows) {
          if (err) return done(err);
          done(null, permissions.percentOccupationFields.result(rows));
        });
      }

    }

  },

  test: function(user, method, done){
    var queryString = permissions[method].query(user);
    console.log(queryString);
    db.get().query(queryString, function(err, rows) {
      if (err) return done(err);
      done(null, permissions[method].result(rows));
    });
  },

  top10: {

    physios: function(done) {
      db.get().query("SELECT CONCAT(firstName, ' ', lastName) as name, UsersPerPhysio as value  FROM (SELECT physioId, count(*) as UsersPerPhysio FROM patient_physio GROUP BY physioId LIMIT 10) sub LEFT OUTER JOIN user_copy u ON u.id = physioId ORDER BY UsersPerPhysio desc", function(err, rows) {
        if (err) return done(err);
        done(null, { title: "Physios by patient", data: rows });
      });
    },

    prescriptions: function(done) {
      db.get().query('SELECT name, count(*) as value FROM prescription GROUP BY name ORDER BY count(*) desc LIMIT 10', function(err, rows) {
        if (err) return done(err);
        done(null, { title: "Prescriptions by patient", data: rows });
      });
    },

    diagnoses: function(done) {
      db.get().query('SELECT diagnosis as name, COUNT(*) as value FROM patient_info_copy WHERE diagnosis is not null AND diagnosis != "" GROUP BY diagnosis ORDER BY count(*) desc LIMIT 10', function(err, rows) {
        if (err) return done(err);
        done(null, { title: "Diagnoses by patient", data: rows });
      });
    },

    locations: function(done) {
      db.get().query('SELECT s.name, count(*) as value FROM user_copy u INNER JOIN site s ON s.id = u.siteId GROUP BY s.name ORDER BY count(*) desc LIMIT 10', function(err, rows) {
        if (err) return done(err);
        done(null, { title: "Locations by patient", data: rows });
      });
    }

  },

  distribution: {

    age: function(user, done) {
      var queryString = permissions.distributionAge.query(user);
      console.log(queryString);
      db.get().query(queryString, function(err, rows) {
        if (err) return done(err);
        done(null, permissions.distributionAge.result(rows));
      });
    },

    sex: function(user, done) {
      var queryString = permissions.distributionSex.query(user);
      console.log(queryString);
      db.get().query(queryString, function(err, rows) {
        if (err) return done(err);
        done(null, permissions.distributionSex.result(rows) );
      });
    },

    bmi: function(user, done) {
      var queryString = permissions.distributionBMI.query(user);
      console.log(queryString);
      db.get().query(queryString, function(err, rows) {
        if (err) return done(err);
        done(null, permissions.distributionBMI.result(rows) );
      });
    },

    timeOfSession: function(user, done) {
      var queryString = permissions.distributionHours.query(user);
      console.log(queryString);
      db.get().query(queryString, function(err, rows) {
        if (err) return done(err);
        done(null, permissions.distributionHours.result(rows) );
      });
    }

  }

};


module.exports = query;
