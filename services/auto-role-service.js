const Rx = require('rx');
const Service = require('chaos-core').Service;

const DataKeys = require('../lib/data-keys');
const {
  RoleAlreadyAddedError,
  RoleNotAddedError,
} = require('../errors');

class AutoRoleService extends Service {
  onListen() {
    this.chaos.streams.guildMemberAdd$
      .flatMap((newMember) => this.handleMemberJoin(newMember))
      .subscribe(
        () => {},
        (error) => this.chaos.handleError(error, [
          { name: "Event", value: "guildMemberAdd$" },
        ])
      )
  }

  handleMemberJoin(newMember) {
    return Rx.Observable.of('')
      .flatMap(() => this.getJoinRoles(newMember.guild))
      .flatMap((roles) => Rx.Observable.from(roles))
      .concatMap((role) => newMember.addRole(role))
      .toArray()
  }

  getJoinRoleIds(guild) {
    return Rx.Observable.of('')
      .flatMap(() => this.chaos.getGuildData(guild.id, DataKeys.JoinRoles))
      .flatMap((roleIds) => Rx.Observable.if(
        () => typeof roleIds === "undefined",
        Rx.Observable.of([]),
        Rx.Observable.of(roleIds),
      ))
  }

  setJoinRoleIds(guild, roleIds) {
    return Rx.Observable.of('')
      .flatMap(() => this.chaos.setGuildData(guild.id, DataKeys.JoinRoles, roleIds))
  }

  getJoinRoles(guild) {
    return Rx.Observable.of('')
      .flatMap(() => this.getJoinRoleIds(guild))
      .flatMap((roleIds) => Rx.Observable.from(roleIds))
      .map((roleId) => guild.roles.get(roleId))
      .filter((role) => role)
      .toArray();
  }

  addJoinRole(guild, role) {
    return Rx.Observable.of('')
      .flatMap(() => this.getJoinRoleIds(guild))
      .flatMap((roleIds) => Rx.Observable.if(
        () => roleIds.indexOf(role.id) === -1,
        Rx.Observable.of(roleIds),
        Rx.Observable.throw(new RoleAlreadyAddedError())
      ))
      .map((roleIds) => ([...roleIds, role.id]))
      .flatMap((roleIds) => this.setJoinRoleIds(guild, roleIds));
  }

  removeJoinRole(guild, role) {
    return Rx.Observable.of('')
      .flatMap(() => this.getJoinRoleIds(guild))
      .flatMap((roleIds) => Rx.Observable.if(
        () => roleIds.indexOf(role.id) > -1,
        Rx.Observable.of(roleIds),
        Rx.Observable.throw(new RoleNotAddedError())
      ))
      .map((roleIds) => {
        roleIds = [...roleIds];
        roleIds.splice(roleIds.indexOf(role.id), 1);
        return roleIds;
      })
      .flatMap((roleIds) => this.setJoinRoleIds(guild, roleIds));
  }
}

module.exports = AutoRoleService;
