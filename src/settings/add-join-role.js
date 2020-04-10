const {of, throwError} = require('rxjs');
const {flatMap, map, catchError} = require('rxjs/operators');
const ChaosCore = require('chaos-core');

const findRole = require('../lib/role-utilities').findRole;
const {
  AutoRoleError,
  RoleAlreadyAddedError,
} = require('../lib/errors');

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

  run(context) {
    const autoRoleService = this.chaos.getService('autoRoles', 'AutoRoleService');
    const guild = context.guild;
    const roleString = context.args.role;

    const role = findRole(guild, roleString);
    if (!role) {
      return of({
        status: 404,
        content: this.strings.roleNotFound({roleString}),
      });
    }

    return of('').pipe(
      flatMap(() => autoRoleService.addJoinRole(guild, role)),
      map(() => ({
        status: 200,
        content: this.strings.roleAdded({roleName: role.name}),
      })),
      catchError((error) => {
        if (error instanceof AutoRoleError) {
          return this.handleAutoRoleError(error);
        } else {
          return throwError(error);
        }
      }),
    );
  }

  handleAutoRoleError(error) {
    if (error instanceof RoleAlreadyAddedError) {
      return of({
        status: 400,
        content: this.strings.alreadyAdded(),
      });
    } else {
      return throwError(error);
    }
  }
}

module.exports = AddJoinRoleAction;
