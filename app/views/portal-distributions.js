var sidebar = require('./components/sidebar.js'),
  charts = require('../charts.js');

var portal = {

  show: function(){

    var tmpl = require('../templates/distributions');
    var html = tmpl();
    $('#page').html(html);
    $('#toggle-button').removeClass('home-screen');

    $('.navbar-brand').removeClass("selected");
    $('.navbar-brand[href*=portal]').addClass("selected");

    charts.drawAgeDistribution($('#chart1'));
    charts.drawSexDistribution($('#chart2'));
    charts.drawBMIDistribution($('#chart3'));

    sidebar.show();
    //sidebar.wireup();

  }

};

module.exports = portal;
