var sidebar = require('./components/sidebar.js'),
  data = require('../data.js');

var portal = {

  show: function(){

    data.getLocations(function(locationData){

      if(location.hash.replace('#','')!=="locations") {
        //user has tabbed away so ignore
        return;
      }

      var tmpl = require('../templates/locations');
      var html = tmpl(locationData);
      $('#page').fadeOut(1000, function(){
        $(this).html(html).fadeIn(1000);
      });

    });

    var tmpl = require('../templates/waiting');
    var html = tmpl();

    $('#page').html(html);
    $('#toggle-button').removeClass('home-screen');

    $('.navbar-brand').removeClass("selected");
    $('.navbar-brand[href*=portal]').addClass("selected");

    sidebar.show();

  }

};

module.exports = portal;
