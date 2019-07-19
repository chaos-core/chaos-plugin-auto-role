const DataKeys = require('./src/lib/data-keys');

module.exports = {
  name: "autoRoles",
  description: "Grants a role to users when they join",

  defaultData: [
    {keyword: DataKeys.JoinRoles, data: []},
  ],
  services: [
    require('./plugin/services/auto-role-service'),
  ],
  configActions: [
    require('./plugin/settings/add-join-role'),
    require('./plugin/settings/rm-join-role'),
    require('./plugin/settings/list'),
  ],
};
