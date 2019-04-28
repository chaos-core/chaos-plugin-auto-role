const {of, from, iif, throwError} = require('rxjs');
const {toArray, flatMap, concatMap, map, filter} = require('rxjs/operators');
const Service = require('chaos-core').Service;

const DataKeys = require('../lib/data-keys');
const {
  RoleAlreadyAddedError,
  RoleNotAddedError,
} = require('../errors');

class AutoRoleService extends Service {
  onListen() {
    this.chaos.streams.guildMemberAdd$.pipe(
      flatMap((newMember) => this.handleMemberJoin(newMember)),
    ).subscribe(
      () => {},
      (error) => this.chaos.handleError(error, [
        {name: "Event", value: "guildMemberAdd$"},
      ]),
    );
  }

  handleMemberJoin(newMember) {
    return of('').pipe(
      flatMap(() => this.getJoinRoles(newMember.guild)),
      flatMap((roles) => from(roles).pipe(
        concatMap((role) => newMember.addRole(role)),
        toArray(),
      )),
    );
  }

  getJoinRoleIds(guild) {
    return of('').pipe(
      flatMap(() => this.chaos.getGuildData(guild.id, DataKeys.JoinRoles)),
      flatMap((roleIds) => iif(
        () => typeof roleIds === "undefined",
        of([]),
        of(roleIds),
      )),
    );
  }

  setJoinRoleIds(guild, roleIds) {
    return of('').pipe(
      flatMap(() => this.chaos.setGuildData(guild.id, DataKeys.JoinRoles, roleIds)),
    );
  }

  getJoinRoles(guild) {
    return of('').pipe(
      flatMap(() => this.getJoinRoleIds(guild)),
      flatMap((roleIds) => from(roleIds)),
      map((roleId) => guild.roles.get(roleId)),
      filter((role) => role),
      toArray(),
    );
  }

  addJoinRole(guild, role) {
    return of('').pipe(
      flatMap(() => this.getJoinRoleIds(guild)),
      flatMap((roleIds) => iif(
        () => roleIds.indexOf(role.id) === -1,
        of(roleIds),
        throwError(new RoleAlreadyAddedError()),
      )),
      map((roleIds) => ([...roleIds, role.id])),
      flatMap((roleIds) => this.setJoinRoleIds(guild, roleIds)),
    );
  }

  removeJoinRole(guild, role) {
    return of('').pipe(
      flatMap(() => this.getJoinRoleIds(guild)),
      flatMap((roleIds) => iif(
        () => roleIds.indexOf(role.id) > -1,
        of(roleIds),
        throwError(new RoleNotAddedError()),
      )),
      map((roleIds) => {
        roleIds = [...roleIds];
        roleIds.splice(roleIds.indexOf(role.id), 1);
        return roleIds;
      }),
      flatMap((roleIds) => this.setJoinRoleIds(guild, roleIds)),
    );
  }
}

module.exports = AutoRoleService;
