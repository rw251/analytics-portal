var Chart = require('chart.js'),
  data = require('data.js');

Chart.controllers.empty = Chart.DatasetController.extend({
  // Create elements for each piece of data in the dataset. Store elements in an array on the dataset as dataset.metaData
  addElements: function() {},

  // Create a single element for the data at the given index and reset its state
  addElementAndReset: function(index) {},

  // Draw the representation of the dataset
  // @param ease : if specified, this number represents how far to transition elements. See the implementation of draw() in any of the provided controllers to see how this should be used
  draw: function(ease) {
    Chart.controllers.bar.prototype.draw.call(this, ease);

    this.chart.chart.ctx.font = "20px " + Chart.defaults.global.tooltipTitleFontFamily;
    this.chart.chart.ctx.textAlign = "center";
    this.chart.chart.ctx.textBaseline = "middle";
    this.chart.chart.ctx.fillStyle = Chart.defaults.global.scaleFontColor;
    this.chart.chart.ctx.fillText("No data in chart.", this.chart.chart.ctx.canvas.clientWidth / 2, this.chart.chart.ctx.canvas.clientHeight / 2);
  },

  // Remove hover styling from the given element
  removeHoverStyle: function(element) {},

  // Add hover styling to the given element
  setHoverStyle: function(element) {},

  // Update the elements in response to new data
  // @param reset : if true, put the elements into a reset state so they can animate to their final values
  update: function(reset) {},

  // Initializes the controller
  initialize: function(chart, datasetIndex) {
    Chart.controllers.bar.prototype.initialize.call(this, chart, datasetIndex);
  },

  // Ensures that the dataset represented by this controller is linked to a scale. Overridden to helpers.noop in the polar area and doughnut controllers as these
  // chart types using a single scale
  linkScales: function() {},

  // Called by the main chart controller when an update is triggered. The default implementation handles the number of data points changing and creating elements appropriately.
  buildOrUpdateElements: function() {}
});

/* takes a string phrase and breaks it into separate phrases
   no bigger than 'maxwidth', breaks are made at complete words.*/

function formatLabel(str, maxwidth) {
  if (typeof(str) !== "string") return str;
  var sections = [];
  var words = str.split(" ");
  var temp = "";

  words.forEach(function(item, index) {
    if (temp.length > 0) {
      var concat = temp + ' ' + item;

      if (concat.length > maxwidth) {
        sections.push(temp);
        temp = "";
      } else {
        if (index == (words.length - 1)) {
          sections.push(concat);
          return;
        } else {
          temp = concat;
          return;
        }
      }
    }

    if (index == (words.length - 1)) {
      sections.push(item);
      return;
    }

    if (item.length < maxwidth) {
      temp = item;
    } else {
      sections.push(item);
    }

  });

  return sections;
}

var drawBarDistribution = function(ctx, result) {
  var maxValue = 0;
  result.data.forEach(function(v) { maxValue = Math.max(maxValue, v.value); });

  ctx.parent().find('.chart-title').text(result.chart.title);

  var myLineChart = new Chart(ctx, {
    type: maxValue === 0 ? 'empty' : 'bar',
    data: {
      labels: result.data.map(function(v) { return v.label; }),
      datasets: [
        {
          label: result.chart.title,
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
          data: result.data.map(function(v) { return v.value; }),
          spanGaps: false,
            }
        ]
    },
    options: {
      legend: {
        display: false
      },
      scales: maxValue === 0 ? {} : {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: result.chart.yTitle
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: result.chart.xTitle
          }
          }]
      }
    }
  });
};

var chts = {
  drawAgeDistribution: function(ctx) {
    data.getAgeDistribution(function(result) {
      drawBarDistribution(ctx, result);
    });
  },

  drawBMIDistribution: function(ctx) {
    data.getBMIDistribution(function(result) {
      drawBarDistribution(ctx, result);
    });
  },

  drawUsageHoursDistribution: function(ctx) {
    data.getUsageHoursDistribution(function(result) {
      drawBarDistribution(ctx, result);
    });
  },

  drawSexDistribution: function(ctx) {
    data.getSexDistribution(function(result) {
      var maxValue = 0;
      result.data.forEach(function(v) { maxValue = Math.max(maxValue, v.value); });

      ctx.parent().find('.chart-title').text(result.title);
      var origCtx = ctx;
      var canvas = ctx[0];
      ctx = canvas.getContext("2d");
      var midX = canvas.width / 2;
      var midY = canvas.height / 2;

      var myPieChart = new Chart(origCtx, {
        type: maxValue === 0 ? 'empty' : 'pie',
        data: {
          labels: result.data.map(function(v) { return v.label; }),
          datasets: [
            {
              data: result.data.map(function(v) { return v.value; }),
              backgroundColor: [
                "#FF6384",
                "#36A2EB"
              ]
          }]
        },
        options: {
          legend: {
            display: false
          },
          tooltips: {
            enabled: false
          },
          animation: {
            onComplete: function() {
              var ctx = this.chart.ctx;
              ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';

              this.data.datasets.forEach(function(dataset) {

                for (var i = 0; i < dataset.data.length; i++) {
                  var textSize = canvas.width / 100;
                  ctx.font = textSize + "px Verdana";
                  var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                    total = dataset._meta[Object.keys(dataset._meta)[0]].total,
                    mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius) / 2,
                    start_angle = model.startAngle,
                    end_angle = model.endAngle,
                    mid_angle = start_angle + (end_angle - start_angle) / 2;

                  var x = mid_radius * Math.cos(mid_angle);
                  var y = mid_radius * Math.sin(mid_angle);

                  ctx.fillStyle = '#fff';
                  if (i == 3) { // Darker text color for lighter background
                    ctx.fillStyle = '#444';
                  }
                  var percent = " (" + String(Math.round(dataset.data[i] / total * 100)) + "%)";
                  ctx.fillText(model.label, model.x + x, model.y + y);
                  ctx.fillText(dataset.data[i] + percent, model.x + x, model.y + y + (textSize*1.3));

                }
              });
            }
          }
        }
      });

    });

  },

  drawExerciseFrequencyDistribution: function(ctx) {
    data.getExerciseFrequencyDistribution(function(result) {
      drawBarDistribution(ctx, result);
    });
  },

  colours: ["rgba(166,206,227,x)", "rgba(31,120,180,x)", "rgba(178,223,138,x)", "rgba(51,160,44,x)", "rgba(251,154,153,x)", "rgba(227,26,28,x)", "rgba(253,191,111,x)", "rgba(255,127,0,x)", "rgba(202,178,214,x)", "rgba(106,61,154,x)"],

  drawTop10Chart: function(category, ctx) {
    data.getTop10(category, function(result) {
      var newdata = result.data.slice(0, 10);
      ctx.parent().find('.chart-title').text(result.title);
      var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: newdata.map(function(v) { return formatLabel(v.name, 20); }), //[result.title],
          datasets: [
            {
              label: result.title,
              data: newdata.map(function(v) { return v.value; }),
              backgroundColor: 'rgba(80,80,83,0.8)'
            }
          ]
        },
        options: {
          legend: {
            display: false
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
                }]
          },
          animation: {
            duration: 0
          }
        }
      });
    });
  }

};

module.exports = chts;
