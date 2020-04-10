const ChaosCore = require('chaos-core');

const findRole = require('../lib/role-utilities').findRole;
const {RoleAlreadyAddedError} = require('../lib/errors');

class AddJoinRoleAction extends ChaosCore.ConfigAction {
  constructor(chaos) {
    super(chaos, {
      name: 'addJoinRole',
      description: "Add a role to the list to automatically grant to new users.",

      args: [
        {
          name: 'role',
          description: 'A name, mention, or ID of a role to grant when a user joins',
          required: true,
        },
      ],
    });
  }

  get strings() {
    return super.strings.userRoles.configActions.addJoinRole;
  }

  async run(context) {
    const autoRoleService = this.chaos.getService('autoRoles', 'AutoRoleService');
    const guild = context.guild;
    const roleString = context.args.role;

    const role = findRole(guild, roleString);
    if (!role) {
      return {
        status: 404,
        content: this.strings.roleNotFound({roleString}),
      };
    }

    try {
      await autoRoleService.addJoinRole(guild, role);
      return {
        status: 200,
        content: this.strings.roleAdded({roleName: role.name}),
      };
    } catch (error) {
      if (error instanceof RoleAlreadyAddedError) {
        return {
          status: 400,
          content: this.strings.alreadyAdded(),
        };
      } else {
        throw error;
      }
    }
  }
}

module.exports = AddJoinRoleAction;
