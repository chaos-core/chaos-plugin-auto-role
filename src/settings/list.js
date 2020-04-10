const RichEmbed = require('discord.js').RichEmbed;
const ChaosCore = require('chaos-core');

class ListAction extends ChaosCore.ConfigAction {
  constructor(chaos) {
    super(chaos, {
      name: 'list',
      description: "list all configured roles",
    });
  }

  get strings() {
    return super.strings.userRoles.configActions.list;
  }

  async run(context) {
    const autoRoleService = this.chaos.getService('autoRoles', 'AutoRoleService');
    const roles = await autoRoleService.getJoinRoles(context.guild);
    const joinRoles = roles.map((r) => r.name);

    let embed = new RichEmbed();
    embed.addField("Join Roles", joinRoles.length >= 1 ? joinRoles.join(', ') : "[None]");

    return {
      status: 200,
      content: this.strings.configuredRoles(),
      embed: embed,
    };
  }
}

module.exports = ListAction;
