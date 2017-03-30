const home = require('./views/home.js');
const portalOverview = require('./views/portal-overview.js');
const portalTop10 = require('./views/portal-top10.js');
const portalDistributions = require('./views/portal-distributions.js');
const portalModel = require('./views/portal-model.js');
const portalLocations = require('./views/portal-locations.js');

const layout = {

  loadView(path, hash) {
    if (path === '/portal') {
      if (hash === '#top10') portalTop10.show();
      else if (hash === '#locations') portalLocations.show();
      else if (hash === '#distributions') portalDistributions.show();
      else if (hash === '#model') portalModel.show();
      else if (hash === '#home') home.show();
      else portalOverview.show();
    } else {
      home.show();
    }
  },

};

module.exports = layout;
