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

      ["physios","prescriptions"].forEach(function(v,i){
        charts.drawTop10Chart(v,$('#chartTop'+i));
      });

      charts.drawAgeDistribution($('#chartDist0'));
      charts.drawSexDistribution($('#chartDist1'));


      sidebar.show();
      //sidebar.wireup();

    });

  }

};

module.exports = portal;
