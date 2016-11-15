var localforage = require('localforage');
var VERSION = "0.0.6";
var DEBUG = true;

var get = function(key, ifExists, ifNotExists) {
  localforage.getItem(key, function(err, value) {
    if (err || !value) {
      return ifNotExists();
    } else {
      return ifExists(value);
    }
  });
};

var data = {

  getLastUpdated: function(callback) {
    $.getJSON('/api/lastupdated', function(data) {
      localforage.getItem('detail', function(err, value) {
        if (DEBUG || err || !value || !value.updated || !value.version || value.updated !== data || value.version != VERSION) {
          localforage.clear(function() {
            localforage.setItem('detail', { updated: data, version: VERSION});
            return callback(data);
          });
        } else {
          return callback(data);
        }
      });
    }).error(function(err) {
      console.log(err);
      return callback("2016-08-01T08:50:56.000Z");
    });
  },

  getSidebar: function(callback) {
    $.getJSON('/api/sidebar', function(data) {
      return callback(data);
    }).error(function(err) {
      console.log(err);
      return callback(["top10", "distributions", "model"]);
    });
  },

  getSummary: function(callback) {

    get('summary', function(value) {
      return callback(value);
    }, function() {
      $.getJSON('/api/summaryparallel', function(data) {
        localforage.setItem('summary', data);
        return callback(data);
      }).error(function(err) {
        console.log(err);
        return callback({ "count": { "allpatients": "120", "activepatients": "65", "dischargedpatients": { "discharged with improvement": 27, "discharged without improvement": 11, "referred for surgery": 12, "failure": 5 }, "locations": "4", "physios": "18", "diagnoses": "6", "prescriptions" : "13" }, "diagnostic": { "age": "59.4595", "occupation": "35.1351", "diagnoses": "35.1351" }, "updated": "2016-08-01T08:50:56.000Z" });
      });
    });

  },

  getAgeDistribution: function(callback) {
    get('distributionAge', function(value) {
      return callback(value);
    }, function() {
      $.getJSON('/api/distribution/age', function(data) {
        localforage.setItem('distributionAge', data);
        return callback(data);
      }).error(function() {
        return callback({ "title": "Age distribution", "data": [{ "label": "0-9", "lower": 0, "value": 0 }, { "label": "10-19", "lower": 10, "value": 5 }, { "label": "20-29", "lower": 20, "value": 6 }, { "label": "30-39", "lower": 30, "value": 5 }, { "label": "40-49", "lower": 40, "value": 3 }, { "label": "50-59", "lower": 50, "value": 4 }, { "label": "60-69", "lower": 60, "value": 0 }, { "label": "70-79", "lower": 70, "value": 1 }, { "label": "80-89", "lower": 80, "value": 0 }, { "label": "90-99", "lower": 90, "value": 0 }] });
      });
    });

  },

  getBMIDistribution: function(callback) {
    get('distributionBMI', function(value) {
      return callback(value);
    }, function() {
      $.getJSON('/api/distribution/bmi', function(data) {
        localforage.setItem('distributionBMI', data);
        return callback(data);
      }).error(function() {
        return callback({ "title": "BMI distribution", "data": [{ "label": "0-4", "lower": 0, "value": 0 }, { "label": "5-9", "lower": 5, "value": 0 }, { "label": "10-14", "lower": 10, "value": 0 }, { "label": "15-19", "lower": 15, "value": 0 }, { "label": "20-24", "lower": 20, "value": 0 }, { "label": "25-29", "lower": 25, "value": 0 }, { "label": "30-34", "lower": 30, "value": 0 }, { "label": "35-39", "lower": 35, "value": 0 }, { "label": "40-44", "lower": 40, "value": 0 }] });
      });
    });
  },

  getUsageHoursDistribution: function(callback) {
    get('distributionHours', function(value) {
      return callback(value);
    }, function() {
      $.getJSON('/api/distribution/timeOfSession', function(data) {
        localforage.setItem('distributionHours', data);
        return callback(data);
      }).error(function() {
        return callback({ "title": "Exercise session start time distribution", "data": [{ "label": "0", "lower": 0, "tot": 0 }, { "label": "1", "lower": 1, "tot": 0 }, { "label": "2", "lower": 2, "tot": 0 }, { "label": "3", "lower": 3, "tot": 0 }, { "label": "4", "lower": 4, "tot": 0 }, { "label": "5", "lower": 5, "tot": 0 }, { "label": "6", "lower": 6, "tot": 0 }, { "label": "7", "lower": 7, "tot": 2 }, { "label": "8", "lower": 8, "tot": 7 }, { "label": "9", "lower": 9, "tot": 21 }, { "label": "10", "lower": 10, "tot": 39 }, { "label": "11", "lower": 11, "tot": 24 }, { "label": "12", "lower": 12, "tot": 19 }, { "label": "13", "lower": 13, "tot": 52 }, { "label": "14", "lower": 14, "tot": 23 }, { "label": "15", "lower": 15, "tot": 15 }, { "label": "16", "lower": 16, "tot": 8 }, { "label": "17", "lower": 17, "tot": 3 }, { "label": "18", "lower": 18, "tot": 5 }, { "label": "19", "lower": 19, "tot": 2 }, { "label": "20", "lower": 20, "tot": 4 }, { "label": "21", "lower": 21, "tot": 1 }, { "label": "22", "lower": 22, "tot": 1 }, { "label": "23", "lower": 23, "tot": 0 }] });
      });
    });
  },

  getSexDistribution: function(callback) {
    get('distributionSex', function(value) {
      return callback(value);
    }, function() {
      $.getJSON('/api/distribution/sex', function(data) {
        localforage.setItem('distributionSex', data);
        return callback(data);
      }).error(function() {
        return callback({ "title": "Sex distribution", "data": [{ "label": "Male", "value": 12 }, { "label": "Female", "value": 17 }] });
      });
    });
  },

  getExerciseFrequencyPerDayDistribution: function(callback) {
    get('exerciseFrequencyPerDay', function(value) {
      return callback(value);
    }, function() {
      $.getJSON('/api/distribution/exerciseFrequencyPerDay', function(data) {
        localforage.setItem('exerciseFrequencyPerDay', data);
        return callback(data);
      }).error(function() {
        return callback({"title":"Prescribed exercise frequency (# per day)","data":[{"label":"1","lower":1,"value":6},{"label":"2","lower":2,"value":2},{"label":"3","lower":3,"value":7},{"label":"4","lower":4,"value":0},{"label":"5","lower":5,"value":0},{"label":"6","lower":6,"value":0},{"label":"7","lower":7,"value":39},{"label":"8","lower":8,"value":0},{"label":"9","lower":9,"value":0},{"label":"10","lower":10,"value":0},{"label":"11","lower":11,"value":0},{"label":"12","lower":12,"value":0},{"label":"13","lower":13,"value":0},{"label":"14","lower":14,"value":21},{"label":"15","lower":15,"value":0},{"label":"16","lower":16,"value":0},{"label":"17","lower":17,"value":0},{"label":"18","lower":18,"value":0},{"label":"19","lower":19,"value":0},{"label":"20","lower":20,"value":0},{"label":"21","lower":21,"value":3},{"label":"22","lower":22,"value":0},{"label":"23","lower":23,"value":0},{"label":"24","lower":24,"value":0},{"label":"25","lower":25,"value":0},{"label":"26","lower":26,"value":0},{"label":"27","lower":27,"value":0},{"label":"28","lower":28,"value":0}]});
      });
    });
  },

  getExerciseFrequencyPerWeekDistribution: function(callback) {
    get('exerciseFrequencyPerWeek', function(value) {
      return callback(value);
    }, function() {
      $.getJSON('/api/distribution/exerciseFrequencyPerWeek', function(data) {
        localforage.setItem('exerciseFrequencyPerWeek', data);
        return callback(data);
      }).error(function() {
        return callback({"title":"Prescribed exercise frequency (# per week)","data":[{"label":"1","lower":1,"value":6},{"label":"2","lower":2,"value":2},{"label":"3","lower":3,"value":7},{"label":"4","lower":4,"value":0},{"label":"5","lower":5,"value":0},{"label":"6","lower":6,"value":0},{"label":"7","lower":7,"value":39},{"label":"8","lower":8,"value":0},{"label":"9","lower":9,"value":0},{"label":"10","lower":10,"value":0},{"label":"11","lower":11,"value":0},{"label":"12","lower":12,"value":0},{"label":"13","lower":13,"value":0},{"label":"14","lower":14,"value":21},{"label":"15","lower":15,"value":0},{"label":"16","lower":16,"value":0},{"label":"17","lower":17,"value":0},{"label":"18","lower":18,"value":0},{"label":"19","lower":19,"value":0},{"label":"20","lower":20,"value":0},{"label":"21","lower":21,"value":3},{"label":"22","lower":22,"value":0},{"label":"23","lower":23,"value":0},{"label":"24","lower":24,"value":0},{"label":"25","lower":25,"value":0},{"label":"26","lower":26,"value":0},{"label":"27","lower":27,"value":0},{"label":"28","lower":28,"value":0}]});
      });
    });
  },

  getLocations: function(callback) {
    get('locations', function(value) {
      return callback(value);
    }, function() {
      $.getJSON('/api/locations', function(data) {
        localforage.setItem('locations', data);
        return callback(data);
      }).error(function() {
        return callback({ "title": "Sex distribution", "data": [{ "label": "Male", "value": 12 }, { "label": "Female", "value": 17 }] });
      });
    });
  },

  getTop10Categories: function(callback) {
    $.getJSON('/api/top10', function(data) {
      return callback(data);
    }).error(function() {
      return callback(["physios", "prescriptions", "diagnoses", "locations"]);
    });
  },

  getTop10: function(category, callback) {
    get('top10.'+category, function(value) {
      return callback(value);
    }, function() {
      $.getJSON('/api/top10/' + category, function(data) {
        localforage.setItem('top10.'+category, data);
        return callback(data);
      }).error(function() {
        data.getTop10FAKE(callback);
      });
    });
  },

  getTop10FAKE: function(callback) {
    var min = Math.random() * 20;
    var range = Math.random() * 50;
    var dt = [];
    var labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    var n = 10;
    while (n > 0) {
      dt.push({ value: min + Math.random() * range, name: labels[10 - n] });
      n--;
    }
    dt.sort(function(a, b) {
      return b.value - a.value;
    });
    return callback({
      title: "Top 10...",
      data: dt
    });
  }

};

module.exports = data;
