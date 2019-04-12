const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chaiSubset = require("chai-subset");
const ChaosCore = require('chaos-core');

chai.use(sinonChai);
chai.use(chaiSubset);

global.sinon = sinon;
global.expect = chai.expect;

global.createChaosStub = () => {
  let chaos = new ChaosCore({
    ownerUserId: 'user-00001',
    loginToken: 'example-token',
    logger: { silent: true },
  });

  chaos.stubService = (pluginName, serviceName, service) => {
    let serviceKey = `${pluginName}.${serviceName}`.toLowerCase();
    chaos.servicesManager._services[serviceKey] = service;
  };

  sinon.stub(chaos, 'handleError').callsFake((error) => { throw error });

  return chaos;
};
