var Lsoa = require('../models/lsoa');
var cache = {};

var randomLatLong = function(coords) {
  var r = Math.floor(Math.random() * (coords.length));
  if (!coords[r]) {
    if (!coords[0]) return;
    else return coords[0];
  }
  return coords[r];
};

module.exports = {

  get: function(lsoa, done) {
    if (cache[lsoa]) return done(null, randomLatLong(cache[lsoa]));
    Lsoa.findOne({ lsoa: lsoa }, function(err, lsoa) {
      if (err) {
        return done(err);
      }
      cache[lsoa] = lsoa;
      var r = Math.floor(Math.random() * (lsoa.coords.length));
      return done(null, lsoa.coords[r]);
    });
  },

  getList: function(lsoas, done) {
    var rtn = lsoas.map(function(v) {
      if (cache[v]) return randomLatLong(cache[v]);
      else return false;
    }).filter(function(v) {
      return v;
    });
    var temp = {};
    lsoas = lsoas.filter(function(v) {
      if (!cache[v]) {
        temp[v] = 1;
        return true;
      }
      return false;
    });

    var distinctLsoas = Object.keys(temp);
    if (distinctLsoas.length === 0) return done(null, rtn);

    Lsoa.find({ lsoa: { $in: distinctLsoas } }, function(err, lsoasFromMongo) {
      if (err) {
        return done(err);
      }
      lsoasFromMongo.forEach(function(v) {
        var coords = v.toObject().coords;
        if (!coords) return;
        cache[v.toObject().lsoa] = coords;
        var r = Math.floor(Math.random() * (coords.length));
        var x = randomLatLong(coords);
        if (x) rtn.push(x);
      });

      return done(null, rtn);
    });
  },

  getLookup: function(lsoas, done) {
    Lsoa.find({ lsoa: { $in: lsoas } }, function(err, lsoas) {
      if (err) {
        return done(err);
      }
      var rtn = {};
      lsoas.forEach(function(v) {
        var coords = v.toObject().coords;
        var r = Math.floor(Math.random() * (coords.length));
        rtn[v.lsoa] = coords[r];
      });

      return done(null, rtn);
    });
  }

};
