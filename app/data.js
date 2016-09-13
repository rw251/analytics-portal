var data = {

  getAgeDistribution: function(callback) {
    $.getJSON('/api/distribution/age', function(data){
      return callback(data);
    });
  },

  getBMIDistribution: function(callback) {
    $.getJSON('/api/distribution/bmi', function(data){
      return callback(data);
    });
  },

  getUsageHoursDistribution: function(callback) {
    $.getJSON('/api/distribution/timeOfSession', function(data){
      return callback(data);
    });
  },

  getSexDistribution: function(callback) {
    $.getJSON('/api/distribution/sex', function(data){
      return callback(data);
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
