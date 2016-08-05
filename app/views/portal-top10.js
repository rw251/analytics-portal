var sidebar = require('./components/sidebar.js'),
  charts = require('../charts.js');

var portal = {

  show: function(){

    var tmpl = require('../templates/top10');
    var html = tmpl();
    $('#page').html(html);

    $('.navbar-brand').removeClass("selected");
    $('.navbar-brand[href*=portal]').addClass("selected");

    [1,2,3,4,5,6,7,8,9,10,11,12].forEach(function(v){
      charts.drawTop10Chart($('#chart'+v));
    });

    sidebar.show();
    sidebar.wireup();

  }

};

module.exports = portal;
