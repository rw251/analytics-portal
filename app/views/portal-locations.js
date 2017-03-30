const sidebar = require('./components/sidebar.js');
const data = require('../data.js');
const $ = require('jquery');
const locationstmpl = require('../templates/locations.jade');
const waitingTmpl = require('../templates/waiting.jade');

const portal = {

  show() {
    data.getLocations((locationData) => {
      if (location.hash.replace('#', '') !== 'locations') {
        // user has tabbed away so ignore
        return;
      }

      const html = locationstmpl(locationData);
      $('#page').fadeOut(1000, function onFadeOut() {
        $(this).html(html).fadeIn(1000);
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
