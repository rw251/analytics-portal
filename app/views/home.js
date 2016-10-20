var sidebar = require('./components/sidebar.js');

var home = {

  show: function(){

    var tmpl = require('../templates/home');
    var html = tmpl();
    $('#page').html(html);
    $('#toggle-button').addClass('home-screen');

    $('.navbar-brand').removeClass("selected");
    $('.navbar-brand:not([href*=portal])').addClass("selected");

    sidebar.hide();
  }

};

module.exports = home;
