const {of, throwError} = require('rxjs');
const {flatMap, map, catchError} = require('rxjs/operators');

const findRole = require('../lib/role-utilities').findRole;
const {
  AutoRoleError,
  RoleNotAddedError,
} = require('../lib/errors');

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

  run(context) {
    const autoRoleService = this.chaos.getService('autoRoles', 'AutoRoleService');
    let guild = context.guild;
    let roleString = context.inputs.role;

    if (!roleString) {
      return of({
        status: 400,
        content: `The name of a role to remove is required`,
      });
    }

    let role = findRole(guild, roleString);
    if (!role) {
      return of({
        status: 404,
        content: `The role '${roleString}' could not be found.`,
      });
    }

    return of('').pipe(
      flatMap(() => autoRoleService.removeJoinRole(guild, role)),
      map(() => ({
        status: 200,
        content: `the role ${role.name} has been removed from the list.`,
      })),
      catchError((error) => {
        if (error instanceof AutoRoleError) {
          return this.handleAutoRoleError(error);
        } else {
          return throwError(error);
        }
      }),
    );
  },

  handleAutoRoleError(error) {
    if (error instanceof RoleNotAddedError) {
      return of({
        status: 400,
        message: 'That role is not on the list.',
      });
    } else {
      return throwError(error);
    }
  },
};
