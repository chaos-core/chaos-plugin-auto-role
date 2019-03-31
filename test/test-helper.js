const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chaiSubset = require("chai-subset");
const NixCore = require('nix-core');

chai.use(sinonChai);
chai.use(chaiSubset);

global.sinon = sinon;
global.expect = chai.expect;

global.createNixStub = () => {
  let nix = new NixCore({
    ownerUserId: 'user-00001',
    loginToken: 'example-token'
  });

  nix.stubService = (moduleName, serviceName, service) => {
    let serviceKey = `${moduleName}.${serviceName}`.toLowerCase();
    nix.servicesManager._services[serviceKey] = service;
  };

  sinon.stub(nix, 'handleError').callsFake((error) => { throw error });

  return nix;
};
