var sidebar = require('./components/sidebar.js');

var portal = {

  show: function(){

    var tmpl = require('../templates/model');
    var html = tmpl();
    $('#page').html(html);
    $('#toggle-button').removeClass('home-screen');

    $('.navbar-brand').removeClass("selected");
    $('.navbar-brand[href!="#home"]').addClass("selected");

    sidebar.show();
    //sidebar.wireup();

  }

};

module.exports = portal;
