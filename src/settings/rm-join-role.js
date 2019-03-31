const Rx = require('rx');

const findRole = require('../lib/role-utilities').findRole;
const {
  AutoRoleError,
  RoleNotAddedError,
} = require('../../errors');

module.exports = {
  name: 'rmJoinRole',
  description: "Remove a role from the list to automatically grant to new users.",

  inputs: [
    {
      name: 'role',
      description: 'A name, mention, or ID of the role to remove',
      required: true,
    },
  ],

  configureAction() {
    this.autoRoleService = this.nix.getService('autoRoles', 'AutoRoleService');
  },

  run(context) {
    let guild = context.guild;
    let roleString = context.inputs.role;

    if (!roleString) {
      return Rx.Observable.of({
        status: 400,
        content: `The name of a role to remove is required`,
      });
    }

    let role = findRole(guild, roleString);
    if (!role) {
      return Rx.Observable.of({
        status: 404,
        content: `The role '${roleString}' could not be found.`,
      });
    }

    return Rx.Observable.of('')
      .flatMap(() => this.autoRoleService.removeJoinRole(guild, role))
      .map(() => ({
        status: 200,
        content: `the role ${role.name} has been removed from the list.`,
      }))
      .catch((error) => {
        if (error instanceof AutoRoleError) {
          return this.handleAutoRoleError(error);
        } else {
          return Rx.Observable.throw(error);
        }
      });
  },

  handleAutoRoleError(error) {
    if (error instanceof RoleNotAddedError) {
      return Rx.Observable.of({
        status: 400,
        message: 'That role is not on the list.',
      });
    } else {
      throw Rx.Observable.throw(error);
    }
  },
};
