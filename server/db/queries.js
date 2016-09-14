var db = require('./db.js');

var histogram = function(data, cats){
  cats = cats.map(function(v){
    return {label: v, lower: +(v.split("-")[0]), value:0};
  });
  data.forEach(function(v){
    for(var i = 0; i < cats.length; i++){
      if(cats[i].lower > v.val) {
        cats[i-1].value++;
        break;
      }
    }
  });
  return cats;
};

module.exports = {

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

  top10: {

    physios: function(done) {
      db.get().query("SELECT CONCAT(firstName, ' ', lastName) as name, UsersPerPhysio as value  FROM (SELECT physioId, count(*) as UsersPerPhysio FROM patient_physio GROUP BY physioId LIMIT 10) sub LEFT OUTER JOIN user_copy u ON u.id = physioId ORDER BY UsersPerPhysio desc", function(err, rows) {
        if (err) return done(err);
        done(null, {title: "Physios by patient", data: rows});
      });
    },

    prescriptions: function(done) {
      db.get().query('SELECT name, count(*) as value FROM prescription GROUP BY name ORDER BY count(*) desc LIMIT 10', function(err, rows) {
        if (err) return done(err);
        done(null, {title: "Prescriptions by patient", data: rows});
      });
    },

    diagnoses: function(done) {
      db.get().query('SELECT diagnosis as name, COUNT(*) as value FROM patient_info_copy WHERE diagnosis is not null AND diagnosis != "" GROUP BY diagnosis ORDER BY count(*) desc LIMIT 10', function(err, rows) {
        if (err) return done(err);
        done(null, {title: "Diagnoses by patient", data: rows});
      });
    },

    locations: function(done) {
      db.get().query('SELECT s.name, count(*) as value FROM user_copy u INNER JOIN site s ON s.id = u.siteId GROUP BY s.name ORDER BY count(*) desc LIMIT 10', function(err, rows) {
        if (err) return done(err);
        done(null, {title: "Locations by patient", data: rows});
      });
    }

  },

  distribution: {

    age: function(done) {
      db.get().query('SELECT (to_days(now()) - to_days(dateOfBirth))/365.25 as val FROM patient_info_copy WHERE dateOfBirth is not null;', function(err, rows) {
        if (err) return done(err);
        done(null, {title: "Age distribution", data: histogram(rows, ["0-9","10-19","20-29","30-39","40-49","50-59","60-69","70-79","80-89","90-99"])});
      });
    },

    sex: function(done) {
      db.get().query('SELECT gender, count(*) as num FROM patient_info_copy WHERE gender is not null GROUP BY gender', function(err, rows) {
        if (err) return done(err);
        done(null, {title: "Sex distribution", data: rows.map(function(v){
          if(v.gender===0) return {label: "Male", value: v.num};
          else return {label: "Female", value: v.num};
        })});
      });
    },

    bmi: function(done) {
      db.get().query('SELECT weight/height*height as val from patient_info_copy where height is not null and weight is not null', function(err, rows) {
        if (err) return done(err);
        done(null, {title: "BMI distribution", data: histogram(rows, ["0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-39","40-44"])});
      });
    },

    timeOfSession: function(done) {
      db.get().query('select hour(startDate)+minute(startDate)/60 as val from exercise_session', function(err, rows) {
        if (err) return done(err);
        done(null, {title: "Usage hours", data: histogram(rows, ["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23"])});
      });
    }

  }

};