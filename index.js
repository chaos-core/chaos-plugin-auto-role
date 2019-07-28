module.exports = {
  name: "autoRoles",
  description: "Grants a role to users when they join",

  services: [
    require('./src/services/auto-role-service'),
  ],

  configActions: [
    require('./src/settings/add-join-role'),
    require('./src/settings/rm-join-role'),
    require('./src/settings/list'),
  ],
};
