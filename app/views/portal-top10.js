var sidebar = require('./components/sidebar.js'),
  charts = require('../charts.js'),
  data = require('../data.js');

var portal = {

  show: function() {

    data.getTop10Categories(function(cats) {

      if (location.hash.replace('#', '') !== "top10") {
        //user has tabbed away so ignore
        return;
      }

      var tmpl = require('../templates/top10');
      var html = tmpl({ n: cats.length });
      
      $('#page').fadeOut(1000, function() {
        $(this).html(html).fadeIn(1000);

        cats.forEach(function(v, idx) {
          charts.drawTop10Chart(v, $('#chart' + idx));
        });
      });


    });

    var tmpl = require('../templates/waiting');
    var html = tmpl();

    $('#page').html(html);
    $('#toggle-button').removeClass('home-screen');

    $('.navbar-brand').removeClass("selected");
    $('.navbar-brand[href!="#home"]').addClass("selected");

    sidebar.show();

  }

};

module.exports = portal;
