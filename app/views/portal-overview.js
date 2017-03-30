const sidebar = require('./components/sidebar.js');
const charts = require('../charts.js');
const data = require('../data.js');
const $ = require('jquery');
const overviewTmpl = require('../templates/overview.jade');
const waitingTmpl = require('../templates/waiting.jade');

const portal = {

  show() {
    data.getSummary((summary) => {
      if (location.hash !== '') {
        // user has tabbed away so ignore
        return;
      }

      const html = overviewTmpl(summary);

      $('#page').fadeOut(1000, function onFadeOut() {
        $(this).html(html).fadeIn(1000);

        ['sitesPerPatient', 'physiosPerPatient'].forEach((v, i) => {
          charts.drawTop10Chart(v, $(`#chartTop${i}`));
        });

        charts.drawAgeDistribution($('#chartDist0'));
        charts.drawSexDistribution($('#chartDist1'));
      });
    });

    const html = waitingTmpl();

    $('#page').html(html);
    $('#toggle-button').removeClass('home-screen');

    $('.navbar-brand').removeClass('selected');
    $('.navbar-brand[href*=portal]').addClass('selected');

    sidebar.show();
  },

};

module.exports = portal;
