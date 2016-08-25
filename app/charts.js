var Chart = require('chart.js'),
  data = require('data.js');

var chts = {
  drawAgeDistribution: function(ctx){
    data.getAgeDistribution(function(result){
      var myLineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: result.labels,
            datasets: [
                {
                    label: "Age distribution",
                    fill: false,
                    lineTension: 0.4,
                    backgroundColor: "rgba(75,192,192,0.4)",
                    borderColor: "rgba(75,192,192,1)",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "rgba(75,192,192,1)",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgba(75,192,192,1)",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: result.values,
                    spanGaps: false,
                }
            ]
        },
        options: {}
      });
    });
  },

  drawBMIDistribution: function(ctx){
    data.getBMIDistribution(function(result){
      var myLineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: result.labels,
            datasets: [
                {
                    label: "BMI distribution",
                    fill: false,
                    lineTension: 0.4,
                    backgroundColor: "rgba(192,75,192,0.4)",
                    borderColor: "rgba(192,75,192,1)",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "rgba(192,75,192,1)",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgba(192,75,192,1)",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: result.values,
                    spanGaps: false,
                }
            ]
        },
        options: {}
      });
    });
  },

  drawSexDistribution: function(ctx){
    data.getSexDistribution(function(result){
      var myPieChart = new Chart(ctx,{
          type: 'pie',
          data: {
      labels: result.labels,
      datasets: [
          {
              data: result.values,
              backgroundColor: [
                  "#FF6384",
                  "#36A2EB"
              ],
              hoverBackgroundColor: [
                  "#FF6384",
                  "#36A2EB"
              ]
          }]
    },
          options: {
          }
      });

    });

  },

  drawTop10Chart: function(ctx){
    data.getTop10(function(result){
      var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: result.labels,
            datasets: [{
                label: 'Top 10...',
                data: result.values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            },
            animation:{
              duration: 0
            }
        }
      });
    });
  }

};

module.exports = chts;
