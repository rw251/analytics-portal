// use npm run docker to start this

var mysql = require('mysql'),
  config = require('../server/config.js'),
  db = config.database,
  fs = require('fs'),
  path = require('path'),
  schemaFile = path.join(__dirname, 'mujo_schema_2016_08_03.sql'),
  dataFile = path.join(__dirname, 'datafrommujo', 'db_data', 'dump.sql');


var createSQL = [
  fs.readFileSync(schemaFile).toString(),
  fs.readFileSync(dataFile).toString(),
].join("\n");

//It might not exist so can't connect without error
//delete config.database;

config.multipleStatements = true;

var test = function(conn, callback){

  conn.connect(function(err){
    if(err) {
      console.log('no connection - try again in 5s');
      setTimeout(function(){
        test(mysql.createConnection(config), callback);
      },5000);
    } else {
      callback();
    }
  });

  conn.end();
};

var main = function(){
  var connection = mysql.createConnection(config);

  connection.connect(function(err) {
    if (err) throw err;

    console.log('connection established');

  });

  connection.query('set global net_buffer_length=1000000; set global max_allowed_packet=1000000000;', function(err) {
    if (err) throw err;

    console.log('props set');
  });

  connection.end(function(err) {
    if (err) throw err;

    console.log('connection ended');

    var conn2 = mysql.createConnection(config);

    conn2.connect(function(err) {
      if (err) throw err;

      console.log('conn2 established');
    });
    conn2.query(createSQL, function(err, rows, fields) {
      if (err) throw err;

      console.log('done');

    });

    conn2.end();
  });

};

test(mysql.createConnection(config), function(){
  main();
});