const ChaosCore = require('chaos-core');

describe('index', function () {
  it('can be loaded by ChaosCore', function () {
    let chaos = ChaosCore.test.createChaosStub();
    chaos.addPlugin(require('./index'));
    expect(chaos.getPlugin('autoRoles')).to.not.be.undefined;
  });
});
