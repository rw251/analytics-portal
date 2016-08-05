var data = {

  getAgeDistribution: function(callback){
    return callback({
      labels: ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90-99"],
      values: [0, 0, 20, 35, 53, 55, 40, 37, 20, 2]
    });
  },

  getSexDistribution: function(callback){
    return callback({labels: ["Male", "Female"], values: [126, 173]});
  },

  getTop10: function(callback){
    var min = Math.random()*20;
    var range = Math.random()*50;
    var dt = [];
    var n = 10;
    while(n>0){
      dt.push(min + Math.random()*range);
      n--;
    }
    dt.sort(function(a,b){
      return b-a;
    });
    return callback({
      labels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
      values: dt
    });
  }

};

module.exports = data;
