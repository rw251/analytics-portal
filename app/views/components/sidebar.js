var isDrawn = false, isVisible = false;

var side = {

  hide: function() {
    $('#sidebar-wrapper').hide(function(){
      isVisible = false;
    });
    $('#page-wrapper').removeClass("main-with-sidebar");
  },

  show: function() {
    if (isDrawn) {
      $('#sidebar-wrapper').show(function(){
        isVisible = true;
      });
    } else {
      var tmpl = require('../../templates/sidebar');
      var html = tmpl();

      $('#sidebar-wrapper').html(html).show();

      var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
      if (width < 768) {
        $('div.navbar-collapse').addClass('collapse');
        //topOffset = $('#side-menu').height();
      } /*else {
        $('div.navbar-collapse').removeClass('collapse');
      }*/
      //

      side.wireup();

      isDrawn = true;
    }
    $('#page-wrapper').addClass("main-with-sidebar");
    setTimeout(side.highlight,0); //so that the change happens before the page renders
  },

  resize: function() {
    var topOffset = 50;
    var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
    if (width < 768) {
      $('div.navbar-collapse').addClass('collapse');
      topOffset += $('#side-menu').height();
    } else {
      $('div.navbar-collapse').removeClass('collapse');
    }

    var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
    height = height - topOffset;
    if (height < 1) height = 1;
    if (height > topOffset) {
      $("#page-wrapper").css("min-height", (height) + "px");
    }
    $("#page-wrapper").css("padding-top", (topOffset) + "px");
  },

  highlight: function(){
    var url = window.location;
    // var element = $('ul.nav a').filter(function() {
    //     return this.href == url;
    // }).addClass('active').parent().parent().addClass('in').parent();
    $('ul.nav a').removeClass('active');
    var element = $('ul.nav a').filter(function() {
      return this.href == url;
    }).addClass('active').parent();

    while (true) {
      if (element.is('li')) {
        element = element.parent().addClass('in').parent();
      } else {
        break;
      }
    }
  },

  wireup: function() {
    $(function() {

      $('#side-menu').metisMenu().on('click', 'a', function() {
        //$('.sidebar-nav').collapse('hide');
      });

      $('.sidebar-nav').on('show.bs.collapse', function() {
        // do something…
      }).on('shown.bs.collapse', function() {
        // do something…
        //side.resize.call(window);
        //$('#sidebar-wrapper').css('position','fixed');
      }).on('hide.bs.collapse', function() {
        // do something…
      }).on('hidden.bs.collapse', function() {
        // do something…
        //$('#sidebar-wrapper').css('position','inherit');
        //side.resize.call(window);
      });

      $('body').on('click', function() {
        $('.sidebar-nav').collapse('hide');
      });

    });

    //Loads the correct sidebar on window load,
    //collapses the sidebar on window resize.
    // Sets the min-height of #page-wrapper to window size
    $(function() {
      $(window).bind("load resize", function() {
        side.resize.call(this);
      });
    });
  }
};

module.exports = side;
