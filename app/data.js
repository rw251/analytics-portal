var data = {

  getSummary: function(callback) {
    $.getJSON('/api/summary', function(data) {
      return callback(data);
    }).error(function() {
      return callback({ "updated": "2016-09-09T08:50:56.000Z", "count": { "allpatients": 40, "activepatients": 0, "locations": 4, "physios": 18, "diagnoses": 6, "prescriptions": 38 }});
    });
  },

  getAgeDistribution: function(callback) {
    $.getJSON('/api/distribution/age', function(data) {
      return callback(data);
    }).error(function() {
      return callback({ "title": "Age distribution", "data": [{ "label": "0-9", "lower": 0, "value": 0 }, { "label": "10-19", "lower": 10, "value": 5 }, { "label": "20-29", "lower": 20, "value": 6 }, { "label": "30-39", "lower": 30, "value": 5 }, { "label": "40-49", "lower": 40, "value": 3 }, { "label": "50-59", "lower": 50, "value": 4 }, { "label": "60-69", "lower": 60, "value": 0 }, { "label": "70-79", "lower": 70, "value": 1 }, { "label": "80-89", "lower": 80, "value": 0 }, { "label": "90-99", "lower": 90, "value": 0 }] });
    });
  },

  getBMIDistribution: function(callback) {
    $.getJSON('/api/distribution/bmi', function(data) {
      return callback(data);
    }).error(function() {
      return callback({ "title": "BMI distribution", "data": [{ "label": "0-4", "lower": 0, "value": 0 }, { "label": "5-9", "lower": 5, "value": 0 }, { "label": "10-14", "lower": 10, "value": 0 }, { "label": "15-19", "lower": 15, "value": 0 }, { "label": "20-24", "lower": 20, "value": 0 }, { "label": "25-29", "lower": 25, "value": 0 }, { "label": "30-34", "lower": 30, "value": 0 }, { "label": "35-39", "lower": 35, "value": 0 }, { "label": "40-44", "lower": 40, "value": 0 }] });
    });
  },

  getUsageHoursDistribution: function(callback) {
    $.getJSON('/api/distribution/timeOfSession', function(data) {
      return callback(data);
    }).error(function() {
      return callback({ "title": "Exercise session start time distribution", "data": [{ "label": "0", "lower": 0, "tot": 0 }, { "label": "1", "lower": 1, "tot": 0 }, { "label": "2", "lower": 2, "tot": 0 }, { "label": "3", "lower": 3, "tot": 0 }, { "label": "4", "lower": 4, "tot": 0 }, { "label": "5", "lower": 5, "tot": 0 }, { "label": "6", "lower": 6, "tot": 0 }, { "label": "7", "lower": 7, "tot": 2 }, { "label": "8", "lower": 8, "tot": 7 }, { "label": "9", "lower": 9, "tot": 21 }, { "label": "10", "lower": 10, "tot": 39 }, { "label": "11", "lower": 11, "tot": 24 }, { "label": "12", "lower": 12, "tot": 19 }, { "label": "13", "lower": 13, "tot": 52 }, { "label": "14", "lower": 14, "tot": 23 }, { "label": "15", "lower": 15, "tot": 15 }, { "label": "16", "lower": 16, "tot": 8 }, { "label": "17", "lower": 17, "tot": 3 }, { "label": "18", "lower": 18, "tot": 5 }, { "label": "19", "lower": 19, "tot": 2 }, { "label": "20", "lower": 20, "tot": 4 }, { "label": "21", "lower": 21, "tot": 1 }, { "label": "22", "lower": 22, "tot": 1 }, { "label": "23", "lower": 23, "tot": 0 }] });
    });
  },

  getSexDistribution: function(callback) {
    $.getJSON('/api/distribution/sex', function(data) {
      return callback(data);
    }).error(function() {
      return callback({ "title": "Sex distribution", "data": [{ "label": "Male", "value": 12 }, { "label": "Female", "value": 17 }] });
    });
  },

  getTop10: function(callback) {
    var min = Math.random() * 20;
    var range = Math.random() * 50;
    var dt = [];
    var n = 10;
    while (n > 0) {
      dt.push(min + Math.random() * range);
      n--;
    }
    dt.sort(function(a, b) {
      return b - a;
    });
    return callback({
      labels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
      values: dt
    });
  }

};

module.exports = data;
