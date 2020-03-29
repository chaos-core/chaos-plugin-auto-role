module.exports = {
  userRoles: {
    configActions: {
      addJoinRole: {
        roleNotFound: ({roleString}) =>
          `The role '${roleString}' could not be found.`,
        roleAdded: ({roleName}) =>
          `The role '${roleName}' will be granted to users when they join.`,
        alreadyAdded: () =>
          `That role is already being granted to new users.`,
      },
      list: {
        configuredRoles: () =>
          `Here are all the configured roles:`,
      },
      rmJoinRole: {
        roleNotFound: ({roleString}) =>
          `The role '${roleString}' could not be found.`,
        roleRemoved: ({roleName}) =>
          `The role '${roleName}' will no longer be granted to users when they join.`,
        notAdded: () =>
          `That role is not being granted to new users.`,
      },
    },
  },
};
