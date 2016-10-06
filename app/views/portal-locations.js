var sidebar = require('./components/sidebar.js'),
  data = require('../data.js');

var portal = {

  show: function(){

    data.getLocations(function(location){

      var tmpl = require('../templates/locations');
      var html = tmpl(location);
      $('#page').html(html);
      $('#toggle-button').removeClass('home-screen');

      $('.navbar-brand').removeClass("selected");
      $('.navbar-brand[href*=portal]').addClass("selected");

      sidebar.show();

    });

  }

};

module.exports = portal;
