module.exports = {
  // See http://brunch.io for documentation.
  paths: {
    public: 'dist',
    watched: ['app', 'vendor'],
  },

  files: {
    javascripts: {
      joinTo: {
        'libraries.js': /^(?!(app|server)\/)/,
      },
      order: {
        before: [
          /jquery/,
          'vendor/scripts/bootstrap.js',
        ],
      },
      entryPoints: {
        'app/script.js': {
          'app.js': /^app\//,
        },
      },
    },
    stylesheets: {
      joinTo: 'app.css',
      order: {
        before: ['vendor/styles/bootstrap.scss'],
      },
    },

    templates: {
      joinTo: 'app.js',
    },
  }, /* ,

  server: {
    run: true,
    path: "server.js",
    port: 3000
  }*/
};
