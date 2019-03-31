const DataKeys = require('./src/lib/data-keys');

module.exports = {
  name: "autoRoles",
  enabledByDefault: true,
  defaultData: [
    {keyword: DataKeys.JoinRoles, data: []}
  ],
  services: [
    require('./src/services/auto-role-service'),
  ],
  configActions: [
    require('./src/settings/add-join-role'),
    require('./src/settings/rm-join-role'),
    require('./src/settings/list'),
  ]
};
