const data = require('../../data.js');
const $ = require('jquery');
const sidebarTmpl = require('../../templates/sidebar.jade');

let isDrawn = false;

const side = {

  hide() {
    $('#sidebar-wrapper').hide();
    $('#page-wrapper').removeClass('main-with-sidebar');
  },

  show() {
    if (isDrawn) {
      $('#sidebar-wrapper').show();
      $('#page-wrapper').addClass('main-with-sidebar');
      setTimeout(side.highlight, 0); // so that the change happens before the page renders
    } else {
      data.getSidebar((menuItems) => {
        const html = sidebarTmpl({ menuItems });

        $('#sidebar-wrapper').html(html).show();

        const width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        if (width < 768) {
          $('div.navbar-collapse').addClass('collapse');
        }

        side.wireup();

        isDrawn = true;
        $('#page-wrapper').addClass('main-with-sidebar');
        setTimeout(side.highlight, 0); // so that the change happens before the page renders
      });
    }
  },

  resize() {
    let topOffset = 50;
    const width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
    if (width < 768) {
      $('div.navbar-collapse').addClass('collapse');
      topOffset += $('#side-menu').height();
    } else {
      $('div.navbar-collapse').removeClass('collapse');
    }

    let height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
    height -= topOffset;
    if (height < 1) height = 1;
    if (height > topOffset) {
      $('#page-wrapper').css('min-height', `${height}px`);
    }
    $('#page-wrapper').css('padding-top', `${topOffset}px`);
  },

  highlight() {
    const url = window.location.href;
    $('ul.nav a').removeClass('active');
    let elList = $('ul.nav a').filter(function listFilter1() {
      return this.href === url;
    });
    if (elList.length === 0) {
      elList = $('ul.nav a').filter(function listFilter12() {
        return this.href[this.href.length - 1] === '#';
      });
    }
    let element = elList.addClass('active').parent().parent().addClass('in')
      .parent();

    while (element.is('li')) {
      element = element.parent().addClass('in').parent();
    }
  },

  wireup() {
    $(() => {
      $('#side-menu').metisMenu();

      $('body').on('click', () => {
        $('.sidebar-nav').collapse('hide');
      });
    });

    // Loads the correct sidebar on window load,
    // collapses the sidebar on window resize.
    // Sets the min-height of #page-wrapper to window size
    $(() => {
      $(window).bind('load resize', function loadOrResizeWindow() {
        side.resize.call(this);
      });
    });
  },
};

module.exports = side;
