/*jslint browser: true*/
/*jshint -W055 */

var layout = require('./layout.js'),
  data = require('./data.js');

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
      data.getLastUpdated(function(val){
        console.log(val);
        layout.loadView(location.pathname, location.hash);
      });
    });

    $(window).on('popstate', function(e) {
      layout.loadView(location.pathname, location.hash);
    });
  }
};

module.exports = App;
