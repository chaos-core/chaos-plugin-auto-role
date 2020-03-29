const ChaosCore = require('chaos-core');

class AutoRolesPlugin extends ChaosCore.Plugin {
  constructor(chaos) {
    super(chaos, {
      name: "autoRoles",
      description: "Grants a role to users when they join",

      services: [
        require('./services/auto-role-service'),
      ],

      configActions: [
        require('./settings/add-join-role'),
        require('./settings/rm-join-role'),
        require('./settings/list'),
      ],

      strings: require('./strings'),
    });
  }
}

module.exports = AutoRolesPlugin;
