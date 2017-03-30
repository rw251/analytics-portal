const sidebar = require('./components/sidebar.js');
const charts = require('../charts.js');
const $ = require('jquery');
const distributionsTmpl = require('../templates/distributions.jade');

const portal = {

  show() {
    const html = distributionsTmpl();
    $('#page').html(html);
    $('#toggle-button').removeClass('home-screen');

    $('.navbar-brand').removeClass('selected');
    $('.navbar-brand[href*=portal]').addClass('selected');

    charts.drawAgeDistribution($('#chart1'));
    charts.drawSexDistribution($('#chart2'));
    charts.drawBMIDistribution($('#chart3'));
    charts.drawUsageHoursDistribution($('#chart4'));
    charts.drawExerciseFrequencyPerDayDistribution($('#chart5'));
    charts.drawExerciseFrequencyPerWeekDistribution($('#chart6'));

    sidebar.show();
    // sidebar.wireup();
  },

};

module.exports = portal;
