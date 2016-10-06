var sidebar = require('./components/sidebar.js'),
  charts = require('../charts.js'),
  data = require('../data.js');

var portal = {

  show: function(){

    data.getTop10Categories(function(cats){

      var tmpl = require('../templates/top10');
      var html = tmpl({n: cats.length});
      $('#page').html(html);
      $('#toggle-button').removeClass('home-screen');

      $('.navbar-brand').removeClass("selected");
      $('.navbar-brand[href!="#home"]').addClass("selected");

      cats.forEach(function(v,idx){
        charts.drawTop10Chart(v,$('#chart'+idx));
      });

      sidebar.show();
      //sidebar.wireup();

    });

  }

};

module.exports = portal;
