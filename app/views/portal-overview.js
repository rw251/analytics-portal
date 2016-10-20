var sidebar = require('./components/sidebar.js'),
  charts = require('../charts.js'),
  data = require('../data.js');

var portal = {

  show: function() {

    data.getSummary(function(summary) {

      if(location.hash!=="") {
        //user has tabbed away so ignore
        return;
      }

      var tmpl = require('../templates/overview');
      var html = tmpl(summary);

      $('#page').fadeOut(1000, function(){
        $(this).html(html).fadeIn(1000);

        ["physios", "prescriptions"].forEach(function(v, i) {
          charts.drawTop10Chart(v, $('#chartTop' + i));
        });

        charts.drawAgeDistribution($('#chartDist0'));
        charts.drawSexDistribution($('#chartDist1'));
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
