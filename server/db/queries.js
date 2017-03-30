const db = require('./db.js');
const permissions = require('./permissions.js');


// Cache some things for reuse in the queries
const CACHE = {};
const GENDER = {
  MALE: 1,
  FEMALE: 0,
};

/**
 * Executes the query and returns the results
 * @param  {object}   sqlObject The query/result object
 * @param  {object}   dataObj   The data to pass to the query
 * @param  {Function} callback  Called with the results
 * @param  {string}   cacheName If specified the results are cached with this name
 * @return undefined               Returns the executed callback
 */
const doQuery = function doQuery(sqlObject, dataObj, callback, cacheName) {
  const queryString = sqlObject.query(dataObj);
  console.log(queryString);
  if (!queryString) {
    // user not allowed
    return callback(new Error('NOAUTH'));
  }
  const r = `query${Math.random().toString()}`;
  if (db.isDebug()) console.time(r);
  return db.get().query(queryString, (err, rows) => {
    if (db.isDebug()) console.timeEnd(r);
    if (err) return callback(err);
    if (sqlObject.result.length === 2) {
      // async takes callback
      return sqlObject.result(rows, (err2, rslt) => {
        if (err2) return callback(err2);
        if (cacheName) CACHE[cacheName] = rslt;
        return callback(null, rslt);
      });
    }
    const rslt = sqlObject.result(rows);
    if (cacheName) CACHE[cacheName] = rslt;
    return callback(null, rslt);
  });
};

const query = {

  summary: {

    allParallel(user, done) {
      const rtn = { count: {}, diagnostic: {} };
      let counter = 0;
      const total = 13;
      let hasErrored = false;

      query.summary.last_updated((err, lu) => {
        if (hasErrored) return;
        if (err) {
          hasErrored = true;
          return done(err);
        }
        rtn.updated = lu;
        counter += 1;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.patients(user, (err, pats) => {
        if (hasErrored) return;
        if (err) {
          hasErrored = true;
          return done(err);
        }
        rtn.count.allpatients = pats;
        counter += 1;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.active_patients(user, (err, act) => {
        if (hasErrored) return;
        if (err) {
          hasErrored = true;
          return done(err);
        }
        rtn.count.activepatients = act;
        counter += 1;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.discharged_patients(user, (err, dis) => {
        if (hasErrored) return;
        if (err && err.message !== 'NOAUTH') {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.count.dischargedpatients = dis;
        counter += 1;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.locations(user, (err, locs) => {
        if (hasErrored) return;
        if (err && err.message !== 'NOAUTH') {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.count.locations = locs;
        counter += 1;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.physios(user, (err, phys) => {
        if (hasErrored) return;
        if (err && err.message !== 'NOAUTH') {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.count.physios = phys;
        counter += 1;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.diagnoses(user, (err, diags) => {
        if (hasErrored) return;
        if (err && err.message !== 'NOAUTH') {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.count.diagnoses = diags;
        counter += 1;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.diagnosesUnique(user, (err, diags) => {
        if (hasErrored) return;
        if (err && err.message !== 'NOAUTH') {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.count.diagnosesUnique = diags;
        counter += 1;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.prescriptions(user, (err, rxs) => {
        if (hasErrored) return;
        if (err && err.message !== 'NOAUTH') {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.count.prescriptions = rxs;
        counter += 1;
        if (counter === total) return done(null, rtn);
      });
      query.summary.count.prescriptionsUnique(user, (err, rxs) => {
        if (hasErrored) return;
        if (err && err.message !== 'NOAUTH') {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.count.prescriptionsUnique = rxs;
        counter += 1;
        if (counter === total) return done(null, rtn);
      });
      query.diagnostic.fieldPercentage.age(user, (err, dAge) => {
        if (hasErrored) return;
        if (err && err.message !== 'NOAUTH') {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.diagnostic.age = dAge;
        counter += 1;
        if (counter === total) return done(null, rtn);
      });
      query.diagnostic.fieldPercentage.occupation(user, (err, dOcc) => {
        if (hasErrored) return;
        if (err && err.message !== 'NOAUTH') {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.diagnostic.occupation = dOcc;
        counter += 1;
        if (counter === total) return done(null, rtn);
      });
      query.diagnostic.fieldPercentage.diagnosis(user, (err, dDia) => {
        if (hasErrored) return;
        if (err && err.message !== 'NOAUTH') {
          hasErrored = true;
          return done(err);
        }
        if (!err) rtn.diagnostic.diagnoses = dDia;
        counter += 1;
        if (counter === total) return done(null, rtn);
      });
    },

    all(user, done) {
      const rtn = { count: {}, diagnostic: {} };
      query.summary.last_updated((luErr, lu) => {
        if (luErr) return done(luErr);
        rtn.updated = lu;
        return query.summary.count.patients(user, (paErr, pats) => {
          if (paErr) return done(paErr);
          rtn.count.allpatients = pats;
          return query.summary.count.active_patients(user, (acErr, act) => {
            if (acErr) return done(acErr);
            rtn.count.activepatients = act;
            return query.summary.count.discharged_patients(user, (diErr, dis) => {
              if (diErr && diErr.message !== 'NOAUTH') return done(diErr);
              if (!diErr) rtn.count.dischargedpatients = dis;
              return query.summary.count.locations(user, (loErr, locs) => {
                if (loErr && loErr.message !== 'NOAUTH') return done(loErr);
                if (!loErr) rtn.count.locations = locs;
                return query.summary.count.physios(user, (phErr, phys) => {
                  if (phErr && phErr.message !== 'NOAUTH') return done(phErr);
                  if (!phErr) rtn.count.physios = phys;
                  return query.summary.count.diagnoses(user, (diaErr, diags) => {
                    if (diaErr && diaErr.message !== 'NOAUTH') return done(diaErr);
                    if (!diaErr) rtn.count.diagnoses = diags;
                    return query.summary.count.prescriptions(user, (prErr, rxs) => {
                      if (prErr && prErr.message !== 'NOAUTH') return done(prErr);
                      if (!prErr) rtn.count.prescriptions = rxs;
                      return query.diagnostic.fieldPercentage.age(user, (agErr, dAge) => {
                        if (agErr && agErr.message !== 'NOAUTH') return done(agErr);
                        if (!agErr) rtn.diagnostic.age = dAge;
                        return query.diagnostic.fieldPercentage.occupation(user, (occErr, dOcc) => {
                          if (occErr && occErr.message !== 'NOAUTH') return done(occErr);
                          if (!occErr) rtn.diagnostic.occupation = dOcc;
                          return query.diagnostic.fieldPercentage.diagnosis(user, (dErr, dDia) => {
                            if (dErr && dErr.message !== 'NOAUTH') return done(dErr);
                            if (!dErr) rtn.diagnostic.diagnoses = dDia;
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

    last_updated(done, cacheIsOk) {
      if (cacheIsOk && CACHE.LAST_UPDATED) return done(null, CACHE.LAST_UPDATED);
      return doQuery(permissions.last_updated, {}, done, 'LAST_UPDATED');
    },

    count: {

      patients(user, done) {
        doQuery(permissions.numberPatients, { user }, done);
      },

      active_patients(user, done) {
        doQuery(permissions.numberActivePatients, { user }, done);
      },

      discharged_patients(user, done) {
        doQuery(permissions.numberDischargedWithOutcome, { user }, done);
      },

      locations(user, done) {
        doQuery(permissions.numberLocations, { user }, done);
      },

      diagnoses(user, done) {
        doQuery(permissions.numberTotalDiagnoses, { user }, done);
      },

      diagnosesUnique(user, done) {
        doQuery(permissions.numberUniqueDiagnoses, { user }, done);
      },

      physios(user, done) {
        doQuery(permissions.numberPhysios, { user }, done);
      },

      prescriptions(user, done) {
        doQuery(permissions.numberTotalPrescriptions, { user }, done);
      },

      prescriptionsUnique(user, done) {
        doQuery(permissions.numberUniquePrescriptions, { user }, done);
      },

    },

  },

  occupations(done, cacheIsOk) {
    if (cacheIsOk && CACHE.OCCUPATIONS) return done(null, CACHE.OCCUPATIONS);
    return db.get().query('SELECT CASE WHEN occupation IS NULL THEN \'Unknown\' ELSE occupation END as val, COUNT(*) as num FROM patient_info_copy GROUP BY CASE WHEN occupation IS NULL THEN \'Unknown\' ELSE occupation END ORDER BY COUNT(*) DESC', (err, rows) => {
      if (err) return done(err);
      CACHE.OCCUPATIONS = rows;
      return done(null, rows);
    });
  },

  diagnoses(done, cacheIsOk) {
    if (cacheIsOk && CACHE.DIAGNOSES) return done(null, CACHE.DIAGNOSES);
    return db.get().query('SELECT CASE WHEN diagnosis is not null AND diagnosis != \'\' THEN diagnosis ELSE \'Unknown\' END as val, COUNT(*) as num FROM patient_info_copy GROUP BY CASE WHEN diagnosis is not null AND diagnosis != \'\' THEN diagnosis ELSE \'Unknown\' END ORDER BY COUNT(*) DESC', (err, rows) => {
      if (err) return done(err);
      CACHE.DIAGNOSES = rows;
      return done(null, rows);
    });
  },

  ages(done, cacheIsOk) {
    if (cacheIsOk && CACHE.AGES) return done(null, CACHE.AGES);
    return query.summary.last_updated((luErr, lu) => {
      db.get().query(`SELECT TIMESTAMPDIFF(YEAR,dateOfBirth,'${lu.toISOString().substr(0, 10)}') AS age, count(*) AS num FROM patient_info_copy GROUP BY TIMESTAMPDIFF(YEAR,dateOfBirth,'${lu.toISOString().substr(0, 10)}')`, (err, rows) => {
        if (err) return done(err);
        CACHE.AGES = rows;
        return done(null, rows);
      });
    });
  },

  sexes(done, cacheIsOk) {
    if (cacheIsOk && CACHE.SEXES) return done(null, CACHE.SEXES);
    return db.get().query(`SELECT CASE gender WHEN ${GENDER.FEMALE} THEN 'F' WHEN ${GENDER.MALE} THEN 'M' ELSE 'U' END AS sex, COUNT(*) AS num FROM patient_info_copy GROUP BY CASE gender WHEN ${GENDER.FEMALE} THEN 'F' WHEN ${GENDER.MALE} THEN 'M' ELSE 'U' END`, (err, rows) => {
      if (err) return done(err);
      CACHE.SEXES = rows;
      return done(null, rows);
    });
  },

  sites(done) {
    db.get().query('SELECT id, name FROM site', (err, rows) => {
      if (err) {
        if (err.message === 'NODB') return done(null, [{ id: 1, name: 'Site A' }, { id: 2, name: 'Site B' }, { id: 3, name: 'Site C' }, { id: 4, name: 'Site D' }]);
        return done(err);
      }
      return done(null, rows);
    });
  },

  diagnostic: {

    fieldPercentage: {

      age(user, done) {
        doQuery(permissions.percentAgeFields, { user }, done);
      },

      diagnosis(user, done) {
        doQuery(permissions.percentDiagnosisFields, { user }, done);
      },

      occupation(user, done) {
        doQuery(permissions.percentOccupationFields, { user }, done);
      },

    },

  },

  test(user, method, done) {
    doQuery(permissions[method], { user }, done);
  },

  locations: {

    // all: locs
    all(user, done) {
      doQuery(permissions.locations, { user }, done);
    },

  },

  top10: {

    sitesPerPatient(user, done) {
      doQuery(permissions.sitesByPatients, { user }, done);
    },
    prescriptionsPerPatient(user, done) {
      doQuery(permissions.prescriptionsByPatients, { user }, done);
    },
    assessmentsPerPatient(user, done) {
      doQuery(permissions.assessmentsByPatients, { user }, done);
    },
    physiosPerPatient(user, done) {
      doQuery(permissions.physiosByNumberPatients, { user }, done);
    },
    occupationsPerPatient(user, done) {
      doQuery(permissions.occupationsByPatients, { user }, done);
    },
    mostCommonFaultByPatients(user, done) {
      doQuery(permissions.mostCommonFaultByPatients, { user }, done);
    },
    physiosByOutcome(user, done) {
      doQuery(permissions.physiosByOutcome, { user }, done);
    },
    deviceByAvgSessionTime(user, done) {
      doQuery(permissions.deviceByAvgSessionTime, { user }, done);
    },
    deviceByBearingLife(user, done) {
      doQuery(permissions.deviceByBearingLife, { user }, done);
    },
    deviceByCableLife(user, done) {
      doQuery(permissions.deviceByCableLife, { user }, done);
    },
    deviceByLoadFactor(user, done) {
      doQuery(permissions.deviceByLoadFactor, { user }, done);
    },

  },

  distribution: {

    age(user, done) {
      doQuery(permissions.distributionAge, { user }, done);
    },

    sex(user, done) {
      doQuery(permissions.distributionSex, { user }, done);
    },

    bmi(user, done) {
      doQuery(permissions.distributionBMI, { user }, done);
    },

    timeOfSession(user, done) {
      doQuery(permissions.distributionHours, { user }, done);
    },

    exerciseFrequencyPerDay(user, done) {
      doQuery(permissions.distributionExerciseFrequencyPerDay, { user }, done);
    },

    exerciseFrequencyPerWeek(user, done) {
      doQuery(permissions.distributionExerciseFrequencyPerWeek, { user }, done);
    },

  },

  model: {

    defaultValues(user, done) {
      query.ages((ageErr, ages) => {
        if (ageErr) return done(ageErr);
        return query.sexes((sexErr, sexes) => {
          if (sexErr) return done(sexErr);
          return query.occupations((occErr, occupations) => {
            if (occErr) return done(occErr);
            return query.diagnoses((diagErr, diagnoses) => {
              if (diagErr) return done(diagErr);
              return done(null, { ages, sexes, occupations, diagnoses });
            }, true);
          }, true);
        }, true);
      }, true);
    },

    averageCompliance(user, params, done) {
      query.summary.last_updated((err1, lu) => {
        query.ages(() => {
          query.sexes(() => {
            query.occupations((occErr, occupations) => {
              query.diagnoses((diagErr, diagnoses) => {
                doQuery(permissions.modelAverageCompliance, {
                  user,
                  params,
                  last_updated: lu,
                  occupations,
                  diagnoses,
                }, done);
              }, true);
            }, true);
          }, true);
        }, true);
      }, true);
    },

  },

};


module.exports = query;
