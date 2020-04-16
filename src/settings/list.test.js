const ChaosCore = require("chaos-core");
const {MockMessage} = require("chaos-core").test.discordMocks;

const AutoRolesPlugin = require('../plugin');

describe('Config: list', function () {
  beforeEach(async function () {
    this.chaos = ChaosCore.test.createChaosStub();
    this.chaos.addPlugin(AutoRolesPlugin);
    this.autoRoleService = this.chaos.getService('autoRoles', 'AutoRoleService');

    this.message = new MockMessage();

    await this.chaos.listen();
    await this.chaos.getService('core', 'PermissionsService')
      .addUser(this.message.guild, 'admin', this.message.author);
    await this.chaos.getService('core', 'PluginService')
      .enablePlugin(this.message.guild.id, 'autoRoles');
  });

  context('!config autoRoles list', function () {
    beforeEach(function () {
      this.message.content = '!config autoRoles list';
    });

    it('emits an embed', async function () {
      const responses = await this.chaos.testMessage(this.message);
      expect(responses[0]).to.have.property('embed');
    });

    describe('roles list', function () {
      it('has section for the join roles', async function () {
        const responses = await this.chaos.testMessage(this.message);
        const field = responses[0].embed.fields
          .find((field) => field.name === 'Join Roles');
        expect(field).to.not.be.undefined;
      });

      describe('join roles', function () {
        context('when there are no roles on the list', function () {
          it('adds a "Join Roles" field, with an empty list', async function () {
            const responses = await this.chaos.testMessage(this.message);
            let field = responses[0].embed.fields
              .find((field) => field.name === 'Join Roles');
            expect(field.value).to.eq('[None]');
          });
        });

        context('when there are roles on the list', function () {
          beforeEach(async function () {
            this.roles = [
              {id: '0000-role-1', name: 'Role1'},
              {id: '0000-role-2', name: 'Role2'},
              {id: '0000-role-3', name: 'Role3'},
            ];

            for (const role of this.roles) {
              this.message.guild.roles.set(role.id, role);
              await this.autoRoleService.addJoinRole(this.message.guild, role);
            }
          });

          it('adds a "Join Roles" field, with a list of all assigned roles', async function () {
            const responses = await this.chaos.testMessage(this.message);
            const field = responses[0].embed.fields
              .find((field) => field.name === 'Join Roles');
            expect(field.value).to.eq('Role1, Role2, Role3');
          });
        });
      });
    });
  });
});
