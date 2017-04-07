const express = require('express');
const compression = require('compression');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');

const config = require('./server/config.js');
const db = require('./server/db/db.js');
const mongodb = require('./server/db/mongodb.js');
const isDebug = true;

module.exports = function (PORT, PATH, CALLBACK) {
  if (isDebug) mongodb.enableDebug();
  mongodb.connect(mongodb.PRODUCTION_URI, () => {
    const lookup = require('./server/controllers/lookup.js');
    lookup.getAll((err) => {
      if (!err) console.log('Lookups cached');
    });
  });

  if (config.aws_mysql.host) {
    if (isDebug) db.enableDebug();
    db.connect(db.MODE_PRODUCTION, config.aws_mysql, (err) => {
      if (err) {
        console.log('Unable to connect to MySQL.');
        process.exit(1);
      } else {
        console.log('MySQL connection established');
      }
    });
  } else if (config.mysql.host) {
    db.connect(db.MODE_PRODUCTION, config.mysql, (err) => {
      if (err) {
        console.log('Unable to connect to MySQL.');
        process.exit(1);
      } else {
        console.log('MySQL connection established');
      }
    });
  } else {
    db.fakeDB(() => {
      console.log('Spoofed MySQL connection established');
    });
  }


  const app = express();

  // enables gzip
  app.use(compression());

  // view engine setup
  // app.set('views', path.join(__dirname, 'views'));
  // app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'server/views'));
  app.set('view engine', 'pug');

  // uncomment after placing your favicon in /public
  // app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false,
  }));

  // Configuring Passport
  const passport = require('passport');
  const expressSession = require('express-session');
  app.use(expressSession({
    secret: config.passport.secret,
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Using the flash middleware provided by connect-flash to store messages in session
  // and displaying in templates
  const flash = require('connect-flash');
  app.use(flash());

  // Initialize Passport
  const initPassport = require('./server/passport/init');
  initPassport(passport);

  const routes = require('./server/routes/index')(passport);
  app.use('/', routes);

  app.use(express.static(path.join(__dirname, PATH)));

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
      res.status(err.status || 500);
      res.render('pages/error.jade', {
        message: err.message,
        error: err,
      });
    });
  }

  // Force ssl on heroku if in production mode
  const forceSsl = function forceSsl(req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
  };
  if (app.get('env') === 'production') {
    app.use(forceSsl);
  }

  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('pages/error.jade', {
      message: err.message,
      error: {},
    });
  });

  /**
   * Module dependencies.
   */

  const debug = require('debug')('passport-mongo:server');
  const http = require('http');

  /**
   * Get port from config or environment and store in Express.
   */

  let port = PORT || config.server.port;
  if (!port) port = process.env.PORT || '3000';
  app.set('port', port);

  /**
   * Create HTTP server.
   */

  const server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  /**
   * Event listener for HTTP server "error" event.
   */

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */

  function onListening() {
    CALLBACK();
    const addr = server.address();
    const bind = typeof addr === 'string' ?
      `pipe ${addr}` :
      `port ${addr.port}`;
    debug(`Listening on ${bind}`);
  }
};
