var db = require('./db.js'),
  permissions = require('./permissions.js'),
  locs = require('./locations.js'); //separate file cause full of data - makes atom slow.. if in this file..

/**
 * @desc Executes the query and returns the results
 * @param object $sqlObject - The query/result object.
 * @param object $dataObj - The data to pass to query.
 * @param function(err, value) $callback - Called with the results
 * @return null
 */
var doQuery = function(sqlObject, dataObj, callback) {
  var queryString = sqlObject.query(dataObj);
  console.log(queryString);
  if (!queryString) {
    //user not allowed
    return callback(new Error("NOAUTH"));
  }
  var r = "query" + Math.random().toString();
  if (db.isDebug()) console.time(r);
  db.get().query(queryString, function(err, rows) {
    if (db.isDebug()) console.timeEnd(r);
    if (err) return callback(err);
    callback(null, sqlObject.result(rows));
  });
};

var query = {

  summary: {

    allParallel: function(user, done) {

      var rtn = { count: {}, diagnostic: {} };
      var counter = 0;
      var total = 11;
      var hasErrored = false;

      query.summary.last_updated(function(err, lu) {
        if (hasErrored) return;
        if (err) {
          hasErrored = true;
          return done(err);
        }
        rtn.updated = lu;
        counter++;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.patients(user, function(err, pats) {
        if (hasErrored) return;
        if (err) {
          hasErrored = true;
          return done(err);
        }
        rtn.count.allpatients = pats;
        counter++;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.active_patients(user, function(err, act) {
        if (hasErrored) return;
        if (err) {
          hasErrored = true;
          return done(err);
        }
        rtn.count.activepatients = act;
        counter++;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.discharged_patients(user, function(err, dis) {
        if (hasErrored) return;
        if (err && err.message !== "NOAUTH") {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.count.dischargedpatients = dis;
        counter++;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.locations(user, function(err, locs) {
        if (hasErrored) return;
        if (err && err.message !== "NOAUTH") {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.count.locations = locs;
        counter++;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.physios(user, function(err, phys) {
        if (hasErrored) return;
        if (err && err.message !== "NOAUTH") {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.count.physios = phys;
        counter++;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.diagnoses(user, function(err, diags) {
        if (hasErrored) return;
        if (err && err.message !== "NOAUTH") {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.count.diagnoses = diags;
        counter++;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.prescriptions(user, function(err, rxs) {
        if (hasErrored) return;
        if (err && err.message !== "NOAUTH") {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.count.prescriptions = rxs;
        counter++;
        if (counter === total) return done(null, rtn);
      });
      query.diagnostic.fieldPercentage.age(user, function(err, dAge) {
        if (hasErrored) return;
        if (err && err.message !== "NOAUTH") {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.diagnostic.age = dAge;
        counter++;
        if (counter === total) return done(null, rtn);
      });
      query.diagnostic.fieldPercentage.occupation(user, function(err, dOcc) {
        if (hasErrored) return;
        if (err && err.message !== "NOAUTH") {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.diagnostic.occupation = dOcc;
        counter++;
        if (counter === total) return done(null, rtn);
      });
      query.diagnostic.fieldPercentage.diagnosis(user, function(err, dDia) {
        if (hasErrored) return;
        if (err && err.message !== "NOAUTH") {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.diagnostic.diagnoses = dDia;
        counter++;
        if (counter === total) return done(null, rtn);
      });

    },

    all: function(user, done) {
      var rtn = { count: {}, diagnostic: {} };
      query.summary.last_updated(function(err, lu) {
        if (err) return done(err);
        rtn.updated = lu;
        query.summary.count.patients(user, function(err, pats) {
          if (err) return done(err);
          rtn.count.allpatients = pats;
          query.summary.count.active_patients(user, function(err, act) {
            if (err) return done(err);
            rtn.count.activepatients = act;
            query.summary.count.discharged_patients(user, function(err, dis) {
              if (err && err.message !== "NOAUTH") return done(err);
              if (!err) rtn.count.dischargedpatients = dis;
              query.summary.count.locations(user, function(err, locs) {
                if (err && err.message !== "NOAUTH") return done(err);
                if (!err) rtn.count.locations = locs;
                query.summary.count.physios(user, function(err, phys) {
                  if (err && err.message !== "NOAUTH") return done(err);
                  if (!err) rtn.count.physios = phys;
                  query.summary.count.diagnoses(user, function(err, diags) {
                    if (err && err.message !== "NOAUTH") return done(err);
                    if (!err) rtn.count.diagnoses = diags;
                    query.summary.count.prescriptions(user, function(err, rxs) {
                      if (err && err.message !== "NOAUTH") return done(err);
                      if (!err) rtn.count.prescriptions = rxs;
                      query.diagnostic.fieldPercentage.age(user, function(err, dAge) {
                        if (err && err.message !== "NOAUTH") return done(err);
                        if (!err) rtn.diagnostic.age = dAge;
                        query.diagnostic.fieldPercentage.occupation(user, function(err, dOcc) {
                          if (err && err.message !== "NOAUTH") return done(err);
                          if (!err) rtn.diagnostic.occupation = dOcc;
                          query.diagnostic.fieldPercentage.diagnosis(user, function(err, dDia) {
                            if (err && err.message !== "NOAUTH") return done(err);
                            if (!err) rtn.diagnostic.diagnoses = dDia;
                            return done(null, rtn);
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    },

    last_updated: function(done) {
      doQuery(permissions.last_updated, {}, done);
    },

    count: {

      patients: function(user, done) {
        doQuery(permissions.numberPatients, { user: user }, done);
      },

      active_patients: function(user, done) {
        doQuery(permissions.numberActivePatients, { user: user }, done);
      },

      discharged_patients: function(user, done) {
        doQuery(permissions.numberDischargedWithOutcome, { user: user }, done);
      },

      locations: function(user, done) {
        doQuery(permissions.numberLocations, { user: user }, done);
      },

      diagnoses: function(user, done) {
        doQuery(permissions.numberDiagnoses, { user: user }, done);
      },

      physios: function(user, done) {
        doQuery(permissions.numberPhysios, { user: user }, done);
      },

      prescriptions: function(user, done) {
        doQuery(permissions.numberTotalPrescriptions, { user: user }, done);
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
        doQuery(permissions.percentAgeFields, { user: user }, done);
      },

      diagnosis: function(user, done) {
        doQuery(permissions.percentDiagnosisFields, { user: user }, done);
      },

      occupation: function(user, done) {
        doQuery(permissions.percentOccupationFields, { user: user }, done);
      }

    }

  },

  test: function(user, method, done) {
    doQuery(permissions[method], { user: user }, done);
  },

  locations: {

    all: locs

  },

  top10: {

    sitesPerPatient: function(user, done) {
      doQuery(permissions.sitesByPatients, { user: user }, done);
    },
    prescriptionsPerPatient: function(user, done) {
      doQuery(permissions.prescriptionsByPatients, { user: user }, done);
    },
    physiosPerPatient: function(user, done) {
      doQuery(permissions.physiosByNumberPatients, { user: user }, done);
    },
    occupationsPerPatient: function(user, done) {
      doQuery(permissions.occupationsByPatients, { user: user }, done);
    },

    /*physios: function(done) {
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
    }*/

  },

  distribution: {

    age: function(user, done) {
      doQuery(permissions.distributionAge, { user: user }, done);
    },

    sex: function(user, done) {
      doQuery(permissions.distributionSex, { user: user }, done);
    },

    bmi: function(user, done) {
      doQuery(permissions.distributionBMI, { user: user }, done);
    },

    timeOfSession: function(user, done) {
      doQuery(permissions.distributionHours, { user: user }, done);
    }

  }

};


module.exports = query;
