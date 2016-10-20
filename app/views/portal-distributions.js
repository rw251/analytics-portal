var sidebar = require('./components/sidebar.js'),
  charts = require('../charts.js');

var portal = {

  show: function(){

    //-- delete after this to enable --//
    $('#page').html('<h1>Under construction</h1>');
    $('#toggle-button').removeClass('home-screen');

    $('.navbar-brand').removeClass("selected");
    $('.navbar-brand[href*=portal]').addClass("selected");

    sidebar.show();
    return;
    //-- --//

    var tmpl = require('../templates/distributions');
    var html = tmpl();
    $('#page').html(html);
    $('#toggle-button').removeClass('home-screen');

    $('.navbar-brand').removeClass("selected");
    $('.navbar-brand[href*=portal]').addClass("selected");

    charts.drawAgeDistribution($('#chart1'));
    charts.drawSexDistribution($('#chart2'));
    charts.drawBMIDistribution($('#chart3'));
    charts.drawUsageHoursDistribution($('#chart4'));

    sidebar.show();
    //sidebar.wireup();

  }

};

module.exports = portal;
