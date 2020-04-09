const Collection = require('discord.js').Collection;
const ChaosCore = require("chaos-core");

const AutoRolesPlugin = require('../plugin');

describe('!config autoRoles list', function () {
  beforeEach(function () {
    this.chaos = ChaosCore.test.createChaosStub();
    this.chaos.addPlugin(AutoRolesPlugin);
    this.autoRoleService = this.chaos.getService('autoRoles', 'AutoRoleService');

    this.guild = {
      id: '22222',
      name: 'Test Guild',
      roles: new Collection(),
    };

    this.message = {guild: this.guild};

    this.runTest$ = () => this.chaos.testConfigAction({
      pluginName: 'autoRoles',
      actionName: 'list',
      message: this.message,
    });
  });

  it('emits an embed', async function () {
    const response = await this.runTest$().toPromise();
    expect(response).to.have.property('embed');
  });

  describe('roles list', function () {
    it('has section for the join roles', async function () {
      const response = await this.runTest$().toPromise();
      const field = response.embed.fields
        .find((field) => field.name === 'Join Roles');
      expect(field).to.not.be.undefined;
    });

    describe('join roles', function () {
      context('when there are no roles on the list', function () {
        it('adds a "Join Roles" field, with an empty list', async function () {
          const response = await this.runTest$().toPromise();
          let field = response.embed.fields
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
            this.guild.roles.set(role.id, role);
            await this.autoRoleService.addJoinRole(this.guild, role).toPromise();
          }
        });

        it('adds a "Join Roles" field, with a list of all assigned roles', async function () {
          const response = await this.runTest$().toPromise();
          const field = response.embed.fields
            .find((field) => field.name === 'Join Roles');
          expect(field.value).to.eq('Role1, Role2, Role3');
        });
      });
    });
  });
});
