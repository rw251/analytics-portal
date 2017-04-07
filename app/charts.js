/* eslint no-new: "off" */

const Chart = require('chart.js');
const data = require('./data.js');
const $ = require('jquery');
const top10TableTmpl = require('./templates/top10table.jade');

Chart.controllers.empty = Chart.DatasetController.extend({
  // Create elements for each piece of data in the dataset. Store elements
  // in an array on the dataset as dataset.metaData
  addElements() {},

  // Create a single element for the data at the given index and reset its state
  addElementAndReset() {},

  // Draw the representation of the dataset
  // @param ease : if specified, this number represents how far to transition
  // elements. See the implementation of draw() in any of the provided
  // controllers to see how this should be used
  draw(ease) {
    Chart.controllers.bar.prototype.draw.call(this, ease);

    this.chart.chart.ctx.font = `20px ${Chart.defaults.global.tooltipTitleFontFamily}`;
    this.chart.chart.ctx.textAlign = 'center';
    this.chart.chart.ctx.textBaseline = 'middle';
    this.chart.chart.ctx.fillStyle = Chart.defaults.global.scaleFontColor;
    this.chart.chart.ctx.fillText('No data in chart.', this.chart.chart.ctx.canvas.clientWidth / 2, this.chart.chart.ctx.canvas.clientHeight / 2);
  },

  // Remove hover styling from the given element
  removeHoverStyle() {},

  // Add hover styling to the given element
  setHoverStyle() {},

  // Update the elements in response to new data
  // @param reset : if true, put the elements into a reset state so they can
  // animate to their final values
  update() {},

  // Initializes the controller
  initialize(chart, datasetIndex) {
    Chart.controllers.bar.prototype.initialize.call(this, chart, datasetIndex);
  },

  // Ensures that the dataset represented by this controller is linked to a
  // scale. Overridden to helpers.noop in the polar area and doughnut controllers as these
  // chart types using a single scale
  linkScales() {},

  // Called by the main chart controller when an update is triggered. The default
  // implementation handles the number of data points changing and creating elements appropriately.
  buildOrUpdateElements() {},
});

/* takes a string phrase and breaks it into separate phrases
   no bigger than 'maxwidth', breaks are made at complete words.*/

/**
 * Takes a string phrase and breaks it into separate phrases no bigger than
 * 'maxwidth', breaks are made at complete words.
 * @param  {string} str      Phrase to break up
 * @param  {number} maxwidth Length of characters to break
 * @return {string}            Phrase with line breaks
 */
function formatLabel(str, maxwidth) {
  if (typeof (str) !== 'string') return str;
  const sections = [];
  const words = str.split(' ');
  let temp = '';

  words.forEach((item, index) => {
    if (temp.length > 0) {
      const concat = `${temp} ${item}`;

      if (concat.length > maxwidth) {
        sections.push(temp);
        temp = '';
      } else if (index === (words.length - 1)) {
        sections.push(concat);
        return;
      } else {
        temp = concat;
        return;
      }
    }

    if (index === (words.length - 1)) {
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

const drawBarDistribution = function drawBarDistribution(ctx, result) {
  let maxValue = 0;
  result.data.forEach((v) => { maxValue = Math.max(maxValue, v.value); });

  ctx.parent().find('.chart-title').text(result.chart.title);
  ctx.parent().find('img').remove();

  new Chart(ctx, {
    type: maxValue === 0 ? 'empty' : 'bar',
    data: {
      labels: result.data.map(v => v.label),
      datasets: [
        {
          label: result.chart.title,
          fill: false,
          lineTension: 0.4,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: result.data.map(v => v.value),
          spanGaps: false,
        },
      ],
    },
    options: {
      legend: {
        display: false,
      },
      scales: maxValue === 0 ? {} : {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: result.chart.yTitle,
          },
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: result.chart.xTitle,
          },
        }],
      },
    },
  });
};

const drawTop10 = function drawTop10(ctx, result) {
  const newdata = result.data.slice(0, 10);
  ctx.parent().find('.chart-title').text(result.title);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: newdata.map(v => formatLabel(v.name, 20)), // [result.title],
      datasets: [
        {
          label: result.title,
          data: newdata.map(v => v.value),
          backgroundColor: 'rgba(80,80,83,0.8)',
        },
      ],
    },
    options: {
      legend: {
        display: false,
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
          },
        }],
      },
      animation: {
        duration: 0,
      },
    },
  });

  // populate table
  const html = top10TableTmpl({ items: result.data });
  ctx.parent().find('img').remove();
  ctx.parent().find('.table-wrapper').hide().html(html);
  ctx.parent().find('.show-table').off('click').on('click', function showTableClick() {
    if ($(this).text() === 'Show as table') {
      $(this).text('Show as chart').removeClass('btn-info').addClass('btn-success');
      const currentCanvasHeight = $(this).parent().parent().find('canvas')
        .height();
      $(this).parent().parent().find('canvas')
        .hide();
      $(this).parent().parent().find('.table-wrapper')
        .show()
        .css('height', currentCanvasHeight);
    } else {
      $(this).text('Show as table').removeClass('btn-success').addClass('btn-info');
      $(this).parent().parent().find('canvas')
        .show();
      $(this).parent().parent().find('.table-wrapper')
        .hide()
        .css('height', '');
    }
  });
};

const chts = {
  drawAgeDistribution(ctx) {
    data.getAgeDistribution((result) => {
      drawBarDistribution(ctx, result);
    });
  },

  drawBMIDistribution(ctx) {
    data.getBMIDistribution((result) => {
      drawBarDistribution(ctx, result);
    });
  },

  drawUsageHoursDistribution(ctx) {
    data.getUsageHoursDistribution((result) => {
      drawBarDistribution(ctx, result);
    });
  },

  drawSexDistribution(context) {
    data.getSexDistribution((result) => {
      let ctx = context;
      let maxValue = 0;
      result.data.forEach((v) => { maxValue = Math.max(maxValue, v.value); });

      ctx.parent().find('.chart-title').text(result.title);
      ctx.parent().find('img').remove();
      const origCtx = ctx;
      const canvas = ctx[0];
      ctx = canvas.getContext('2d');

      new Chart(origCtx, {
        type: maxValue === 0 ? 'empty' : 'pie',
        data: {
          labels: result.data.map(v => v.label),
          datasets: [
            {
              data: result.data.map(v => v.value),
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
              ],
            }],
        },
        options: {
          legend: {
            display: false,
          },
          tooltips: {
            enabled: false,
          },
          animation: {
            onComplete() {
              const thisCtx = this.chart.ctx;
              thisCtx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
              thisCtx.textAlign = 'center';
              thisCtx.textBaseline = 'bottom';

              this.data.datasets.forEach((dataset) => {
                for (let i = 0; i < dataset.data.length; i += 1) {
                  const textSize = canvas.width / 100;
                  thisCtx.font = `${textSize}px Verdana`;
                  const model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
                  const total = dataset._meta[Object.keys(dataset._meta)[0]].total;
                  const midRadius = model.innerRadius +
                    ((model.outerRadius - model.innerRadius) / 2);
                  const startAngle = model.startAngle;
                  const endAngle = model.endAngle;
                  const midAngle = startAngle + ((endAngle - startAngle) / 2);

                  const x = midRadius * Math.cos(midAngle);
                  const y = midRadius * Math.sin(midAngle);

                  thisCtx.fillStyle = '#fff';
                  if (i === 3) { // Darker text color for lighter background
                    thisCtx.fillStyle = '#444';
                  }
                  const percent = ` (${String(Math.round((dataset.data[i] / total) * 100))}%)`;
                  thisCtx.fillText(model.label, model.x + x, model.y + y);
                  thisCtx.fillText(dataset.data[i] + percent, model.x + x,
                    model.y + y + (textSize * 1.3));
                }
              });
            },
          },
        },
      });
    });
  },

  drawExerciseFrequencyPerDayDistribution(ctx) {
    data.getExerciseFrequencyPerDayDistribution((result) => {
      drawBarDistribution(ctx, result);
    });
  },

  drawExerciseFrequencyPerWeekDistribution(ctx) {
    data.getExerciseFrequencyPerWeekDistribution((result) => {
      drawBarDistribution(ctx, result);
    });
  },

  colours: ['rgba(166,206,227,x)', 'rgba(31,120,180,x)', 'rgba(178,223,138,x)', 'rgba(51,160,44,x)', 'rgba(251,154,153,x)', 'rgba(227,26,28,x)', 'rgba(253,191,111,x)', 'rgba(255,127,0,x)', 'rgba(202,178,214,x)', 'rgba(106,61,154,x)'],

  drawTop10Chart(category, ctx) {
    data.getTop10(category, (result) => {
      drawTop10(ctx, result);
    });
  },

  drawTop10ChartWithData(result, ctx) {
    drawTop10(ctx, result);
  },

};

module.exports = chts;
