var home = require('views/home.js'),
  portalOverview = require('views/portal-overview.js'),
  portalTop10 = require('views/portal-top10.js'),
  portalDistributions = require('views/portal-distributions.js'),
  portalModel = require('views/portal-model.js'),
  portalLocations = require('views/portal-locations.js');

var layout = {

  loadView: function(path, hash){

    if(path==="/portal") {
      if(hash==='#top10') portalTop10.show();
      else if(hash==='#locations') portalLocations.show();
      else if(hash==='#distributions') portalDistributions.show();
      else if(hash==='#model') portalModel.show();
      else if(hash==='#home') home.show();
      else portalOverview.show();
    } else {
      home.show();
    }
  }

};

module.exports = layout;
