var sidebar = require('./components/sidebar.js'),
  charts = require('../charts.js');

var portal = {

  show: function(){

    var tmpl = require('../templates/overview');
    var html = tmpl();
    $('#page').html(html);

    $('.navbar-brand').removeClass("selected");
    $('.navbar-brand[href*=portal]').addClass("selected");

    [1,2,3].forEach(function(v){
      charts.drawTop10Chart($('#chart'+v));
    });

    charts.drawAgeDistribution($('#chart4'));
    charts.drawSexDistribution($('#chart5'));


    sidebar.show();
    sidebar.wireup();

  }

};

module.exports = portal;
