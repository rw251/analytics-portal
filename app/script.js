/*jslint browser: true*/
/*jshint -W055 */

var layout = require('./layout.js');

var App = {
  init: function init() {
    /*$(window).load(function() {
      $('.loading-container').fadeOut(1000, function() {
        //$(this).remove();
      });
    });*/
    /******************************************
     *** This happens when the page is ready ***
     ******************************************/
    $(document).on('ready', function() {
      //hack to auto load what i'm working on
      //location.hash="#portal";
      layout.loadView(location.hash);
    });

    $(window).on('popstate', function(e) {
      layout.loadView(location.hash);
    });
  }
};

module.exports = App;
