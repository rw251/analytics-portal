const layout = require('./layout.js');
const data = require('./data.js');
const $ = require('jquery');

// Put jquery in global space for bootstrap and metismenu
window.$ = $;
window.jQuery = $;
require('bootstrap');
require('metismenu');


const App = {
  init: function init() {
    /** ****************************************
     *** This happens when the page is ready ***
     ******************************************/
    $(document).on('ready', () => {
      setTimeout(() => {
        $('#side-menu').metisMenu();
      }, 0);
      data.getLastUpdated(() => {
        layout.loadView(location.pathname, location.hash);
      });
    });

    $(window).on('popstate', () => {
      layout.loadView(location.pathname, location.hash);
    });
  },
};

module.exports = App;
