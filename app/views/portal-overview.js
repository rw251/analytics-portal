var sidebar = require('./components/sidebar.js'),
  charts = require('../charts.js'),
  data = require('../data.js');

var portal = {

  show: function(){

    data.getSummary(function(summary){

      var tmpl = require('../templates/overview');
      var html = tmpl(summary);
      $('#page').html(html);
      $('#toggle-button').removeClass('home-screen');

      $('.navbar-brand').removeClass("selected");
      $('.navbar-brand[href*=portal]').addClass("selected");

      [1,2,3].forEach(function(v){
        charts.drawTop10Chart($('#chart'+v));
      });
  
      charts.drawAgeDistribution($('#chart4'));
      charts.drawSexDistribution($('#chart5'));


      sidebar.show();
      //sidebar.wireup();

    });

  }

};

module.exports = portal;
