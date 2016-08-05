var sidebar = require('./components/sidebar.js');

var portal = {

  show: function(){

    var tmpl = require('../templates/model');
    var html = tmpl();
    $('#page').html(html);

    $('.navbar-brand').removeClass("selected");
    $('.navbar-brand[href*=portal]').addClass("selected");

    sidebar.show();
    sidebar.wireup();

  }

};

module.exports = portal;
