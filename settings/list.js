const Rx = require('rx');
const RichEmbed = require('discord.js').RichEmbed;

module.exports = {
  name: 'list',
  description: "list all configured roles",

  onListen() {
    this.autoRoleService = this.chaos.getService('autoRoles', 'AutoRoleService');
  },

  run(context) {
    return Rx.Observable.of('')
      .flatMap(() =>
        this.autoRoleService.getJoinRoles(context.guild)
          .map((roles) => roles.map((r) => r.name))
      )
      .map((joinRoles) => {
        let embed = new RichEmbed();
        embed.addField("Join Roles", joinRoles.length >= 1 ? joinRoles.join(', ') : "[None]");

        return {
          status: 200,
          content: "Here are all the configured roles:",
          embed: embed,
        };
      });
  },
};
