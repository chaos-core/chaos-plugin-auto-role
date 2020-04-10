const {of, throwError} = require('rxjs');
const {flatMap, map, catchError} = require('rxjs/operators');
const ChaosCore = require('chaos-core');

const findRole = require('../lib/role-utilities').findRole;
const {
  AutoRoleError,
  RoleNotAddedError,
} = require('../lib/errors');


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

  run(context) {
    const autoRoleService = this.chaos.getService('autoRoles', 'AutoRoleService');
    let guild = context.guild;
    let roleString = context.args.role;

    let role = findRole(guild, roleString);
    if (!role) {
      return of({
        status: 404,
        content: this.strings.roleNotFound({roleString}),
      });
    }

    return of('').pipe(
      flatMap(() => autoRoleService.removeJoinRole(guild, role)),
      map(() => ({
        status: 200,
        content: this.strings.roleRemoved({roleName: role.name}),
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
    if (error instanceof RoleNotAddedError) {
      return of({
        status: 400,
        content: this.strings.notAdded(),
      });
    } else {
      return throwError(error);
    }
  }
}

module.exports = RmJoinRoleAction;
