var Lookup = require('../models/lookup');
var cache = {};

module.exports = {

  cache: function(id){
    if(id) return cache[id];
    else return cache;
  },

  getAll: function(done) {
    Lookup.find({}, function(err, lookups) {
      if(err) return done(err);
      if (!lookups) {
        console.log('No lookup found');
        return done(null, false);
      } else {
        lookups.forEach(function(v){
          cache[v.category] = {};
          v.lookup.forEach(function(vv){
            cache[v.category][vv.key] = vv.value;
          });
        });
        done(null, cache);
      }
    });
  },

  get: function(category, done) {
    Lookup.findOne({category: category}, function(err, lookup) {
      if (err) {
        return done(err);
      }
      return done(null, lookup);
    });
  },

  addGroup: function(name, done) {
    name = name.replace(" ","");
    var l = new Lookup({category: name});
    l.save(function(err){
      if(err) return done(err);
      cache[name] = {};
      return done(null);
    });
  },

  updateGroup: function(name, newtext, done) {
    console.log(name, newtext);
    Lookup.findOne({category: name}, function(err, lookup){
      if(err) return done(err);
      var values = [];
      newtext.split("\n").forEach(function(v){
        var vals = v.split("|");
        if(vals.length!==2) return;
        values.push({key: vals[0], value: vals[1]});
      });
      if(values.length>0) {
        console.log(lookup);
        lookup.lookup = values;
        lookup.save(function(err){
          if(err) return done(err);
          cache[name] = {};
          values.forEach(function(v){
            cache[name][v.key] = v.value;
          });
          return done(null);
        });
      } else {
        return done(null, false);
      }
    });
  }

};
