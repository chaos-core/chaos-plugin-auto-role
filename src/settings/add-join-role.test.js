const ChaosCore = require("chaos-core");
const Discord = require("discord.js");

const AutoRolesPlugin = require('../plugin');

describe('Config: addJoinRole', function () {
  beforeEach(async function () {
    this.chaos = ChaosCore.test.createChaosStub();
    this.chaos.addPlugin(AutoRolesPlugin);
    this.autoRoleService = this.chaos.getService('autoRoles', 'AutoRoleService');

    this.message = this.chaos.createMessage();
    this.message.guild.roles = new Discord.Collection();
    this.role = {id: '11111', name: 'Role1'};

    await this.chaos.listen();
    await this.chaos.getService('core', 'PermissionsService')
      .addUser(this.message.guild, 'admin', this.message.author);
    await this.chaos.getService('core', 'PluginService')
      .enablePlugin(this.message.guild.id, 'autoRoles');
  });

  context('!config autoRoles addJoinRole', function () {
    beforeEach(function () {
      this.message.content = '!config autoRoles addJoinRole';
    });

    it('emits an error message', async function () {
      const responses = await this.chaos.testMessage(this.message);
      expect(responses[0]).to.containSubset({
        "content": "I'm sorry, but I'm missing some information for that command:",
      });
    });
  });


  context('!config autoRoles addJoinRole {role}', function () {
    beforeEach(function () {
      this.message.content = `!config autoRoles addJoinRole ${this.role.name}`;
    });

    context('when the role is already on the list', function () {
      beforeEach(async function () {
        this.message.guild.roles.set(this.role.id, this.role);
        await this.autoRoleService.addJoinRole(this.message.guild, this.role);
      });

      it('emits an error message', async function () {
        const responses = await this.chaos.testMessage(this.message);
        expect(responses[0]).to.containSubset({
          content: 'That role is already being granted to new users.',
        });
      });
    });

    [
      {type: 'a mention', value: '<@&11111>'},
      {type: 'a name', value: 'Role1'},
      {type: 'an id', value: '11111'},
    ].forEach((input) => {
      context(`when a role is given as ${input.type}`, function () {
        beforeEach(function () {
          this.message.content = `!config autoRoles addJoinRole ${input.value}`;
        });

        context('when the role exists in the guild', function () {
          beforeEach(function () {
            this.message.guild.roles.set(this.role.id, this.role);
          });

          it('adds the correct role to the list', async function () {
            sinon.spy(this.autoRoleService, 'addJoinRole');
            await this.chaos.testMessage(this.message);
            expect(this.autoRoleService.addJoinRole)
              .to.have.been.calledWith(this.message.guild, this.role);
          });

          it('emits a success message', async function () {
            const responses = await this.chaos.testMessage(this.message);
            expect(responses[0]).to.containSubset({
              content: "The role 'Role1' will be granted to users when they join.",
            });
          });
        });

        context('when the role does not exist in the guild', function () {
          it('emits an error message', async function () {
            const responses = await this.chaos.testMessage(this.message);
            expect(responses[0]).to.containSubset({
              content: `The role '${input.value}' could not be found.`,
            });
          });
        });
      });
    });
  });
});
