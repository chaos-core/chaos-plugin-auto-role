const {of, throwError} = require('rxjs');
const {flatMap, map, catchError} = require('rxjs/operators');

const findRole = require('../lib/role-utilities').findRole;
const {
  AutoRoleError,
  RoleAlreadyAddedError,
} = require('../errors');

module.exports = {
  name: 'addJoinRole',
  description: "Add a role to the list to automatically grant to new users.",

  inputs: [
    {
      name: 'role',
      description: 'A name, mention, or ID of a role to grant when a user joins',
      required: true,
    },
  ],

  onListen() {
    this.autoRoleService = this.chaos.getService('autoRoles', 'AutoRoleService');
  },

  run(context) {
    let guild = context.guild;
    let roleString = context.inputs.role;

    if (!roleString) {
      return of({
        status: 400,
        content: `The name of a role to assign is required`,
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
      flatMap(() => this.autoRoleService.addJoinRole(guild, role)),
      map(() => ({
        status: 200,
        content: `the role ${role.name} will be granted to users when they join`,
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
    if (error instanceof RoleAlreadyAddedError) {
      return of({
        status: 400,
        message: 'That role is already being granted to new users.',
      });
    } else {
      return throwError(error);
    }
  },
};
