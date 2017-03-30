const sidebar = require('./components/sidebar.js');
const $ = require('jquery');
const homeTmpl = require('../templates/home.jade');

const home = {

  show() {
    const html = homeTmpl();
    $('#page').html(html);
    $('#toggle-button').addClass('home-screen');

    $('.navbar-brand').removeClass('selected');
    $('.navbar-brand:not([href*=portal])').addClass('selected');

    sidebar.hide();
  },

};

module.exports = home;
