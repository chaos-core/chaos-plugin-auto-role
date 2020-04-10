const ChaosCore = require('chaos-core');

const findRole = require('../lib/role-utilities').findRole;
const {RoleNotAddedError} = require('../lib/errors');


class RmJoinRoleAction extends ChaosCore.ConfigAction {
  constructor(chaos) {
    super(chaos, {
      name: 'rmJoinRole',
      description: "Remove a role from the list to automatically grant to new users.",

      args: [
        {
          name: 'role',
          description: 'A name, mention, or ID of the role to remove',
          required: true,
        },
      ],
    });
  }

  get strings() {
    return super.strings.userRoles.configActions.rmJoinRole;
  }

  async run(context) {
    const autoRoleService = this.chaos.getService('autoRoles', 'AutoRoleService');
    let guild = context.guild;
    let roleString = context.args.role;

    let role = findRole(guild, roleString);
    if (!role) {
      return {
        status: 404,
        content: this.strings.roleNotFound({roleString}),
      };
    }

    try {
      await autoRoleService.removeJoinRole(guild, role);
      return {
        status: 200,
        content: this.strings.roleRemoved({roleName: role.name}),
      };
    } catch (error) {
      if (error instanceof RoleNotAddedError) {
        return {
          status: 400,
          content: this.strings.notAdded(),
        };
      } else {
        throw error;
      }
    }
  }
}

module.exports = RmJoinRoleAction;
