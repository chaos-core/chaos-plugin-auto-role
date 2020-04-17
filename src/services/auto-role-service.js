const Service = require('chaos-core').Service;

const DataKeys = require('../lib/data-keys');
const {
  RoleAlreadyAddedError,
  RoleNotAddedError,
} = require('../lib/errors');

class AutoRoleService extends Service {
  constructor(chaos) {
    super(chaos);

    this.chaos.on("guildMemberAdd", async (newMember) => this.handleMemberJoin(newMember));
  }

  async isPluginEnabled(guild) {
    return this.chaos.getService('core', 'PluginService')
      .isPluginEnabled(guild.id, 'autoRoles');
  }

  async handleMemberJoin(newMember) {
    if(await this.isPluginEnabled(newMember.guild)) {
      const roles = await this.getJoinRoles(newMember.guild);
      for (const role of roles) {
        await newMember.addRole(role);
      }
    }
  }

  async getJoinRoleIds(guild) {
    const roleIds = await this.getGuildData(guild.id, DataKeys.JoinRoles);
    return roleIds || [];
  }

  async setJoinRoleIds(guild, roleIds) {
    return this.setGuildData(guild.id, DataKeys.JoinRoles, roleIds);
  }

  async getJoinRoles(guild) {
    const roleIds = await this.getJoinRoleIds(guild);
    const roles = roleIds.map((roleId) => guild.roles.get(roleId));
    return roles.filter((role) => role);
  }

  async addJoinRole(guild, role) {
    const roleIds = await this.getJoinRoleIds(guild);
    if (roleIds.indexOf(role.id) !== -1) {
      throw new RoleAlreadyAddedError();
    }
    roleIds.push(role.id);
    return this.setJoinRoleIds(guild, roleIds);
  }

  async removeJoinRole(guild, role) {
    const roleIds = await this.getJoinRoleIds(guild);
    if (roleIds.indexOf(role.id) === -1) {
      throw new RoleNotAddedError();
    }
    roleIds.splice(roleIds.indexOf(role.id), 1);
    return this.setJoinRoleIds(guild, roleIds);
  }
}

module.exports = AutoRoleService;
