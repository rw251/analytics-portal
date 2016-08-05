var home = require('views/home.js'),
  portalOverview = require('views/portal-overview.js'),
  portalTop10 = require('views/portal-top10.js'),
  portalDistributions = require('views/portal-distributions.js'),
  portalModel = require('views/portal-model.js');

var layout = {

  loadView: function(hash){

    var urlBits = hash.split("/");

    if(urlBits[0] === '#portal'){
      if(!urlBits[1]) portalOverview.show();
      else if(urlBits[1]==='top10') portalTop10.show(urlBits);
      else if(urlBits[1]==='distributions') portalDistributions.show(urlBits);
      else if(urlBits[1]==='model') portalModel.show(urlBits);
      else home.show();
    }
    else home.show();
  }

};

module.exports = layout;
