const sidebar = require('./components/sidebar.js');
const charts = require('../charts.js');
const data = require('../data.js');
const $ = require('jquery');
const top10Tmpl = require('../templates/top10.jade');
const waitingTmpl = require('../templates/waiting.jade');

const portal = {

  show() {
    data.getTop10Categories((cats) => {
      if (location.hash.replace('#', '') !== 'top10') {
        // user has tabbed away so ignore
        return;
      }

      const html = top10Tmpl({ n: cats.length });

      $('#page').fadeOut(1000, function onFadeOut() {
        $(this).html(html).fadeIn(1000);

        cats.forEach((v, idx) => {
          charts.drawTop10Chart(v, $(`#chart${idx}`));
        });
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
