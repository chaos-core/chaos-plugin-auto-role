const DataKeys = require('./lib/data-keys');

module.exports = {
  name: "autoRoles",
  description: "Grants a role to users when they join",
  
  defaultData: [
    {keyword: DataKeys.JoinRoles, data: []}
  ],
  services: [
    require('./services/auto-role-service'),
  ],
  configActions: [
    require('./settings/add-join-role'),
    require('./settings/rm-join-role'),
    require('./settings/list'),
  ]
};
