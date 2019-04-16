const Rx = require('rx');
const Collection = require('discord.js').Collection;
const ConfigAction = require('chaos-core').ConfigAction;
const ChaosCore = require("chaos-core");

const AutoRoleService = require('../../services/auto-role-service');
const listRoles = require('../../settings/list');

describe('!settings autoRoles list', function () {
  beforeEach(function () {
    this.chaos = ChaosCore.test.createChaosStub();
    this.autoRoleService = new AutoRoleService(this.chaos);

    this.chaos.stubService('autoRoles', 'AutoRoleService', this.autoRoleService);

    this.listRoles = new ConfigAction(listRoles);
    this.listRoles.chaos = this.chaos;

    this.listRoles.onListen();
  });

  context('#onListen', function () {
    it('loads the AutoRoleService', function () {
      expect(this.listRoles.autoRoleService).to.eq(this.autoRoleService);
    });
  });

  describe('#run', function () {
    beforeEach(function () {
      this.guild = {
        id: '22222',
        name: 'Test Guild',
        roles: new Collection(),
      };

      this.context = {
        guild: this.guild,
      };
    });

    it('emits a single response', function (done) {
      this.listRoles.run(this.context)
        .count(() => true)
        .do((count) => expect(count).to.equal(1))
        .subscribe(() => done(), (error) => done(error));
    });

    it('emits an embed', function (done) {
      this.listRoles.run(this.context)
        .do((response) => expect(response).to.have.property('embed'))
        .subscribe(() => done(), (error) => done(error));
    });

    describe('roles list', function () {
      it('has section for the join roles', function (done) {
        this.listRoles.run(this.context)
          .flatMap((response) => response.embed.fields)
          .find((field) => field.name === 'Join Roles')
          .do((field) => expect(field).to.not.be.undefined)
          .subscribe(() => done(), (error) => done(error));
      });

      describe('join roles', function () {
        context('when there are no roles on the list', function () {
          it('adds a "Join Roles" field, with an empty list', function (done) {
            this.listRoles.run(this.context)
              .flatMap((response) => response.embed.fields)
              .find((field) => field.name === 'Join Roles')
              .do((field) => expect(field.value).to.eq('[None]'))
              .subscribe(() => done(), (error) => done(error));
          });
        });

        context('when there are roles on the list', function () {
          beforeEach(function (done) {
            this.roles = [
              {id: '0000-role-1', name: 'Role1'},
              {id: '0000-role-2', name: 'Role2'},
              {id: '0000-role-3', name: 'Role3'},
            ];

            Rx.Observable.from(this.roles)
              .do((role) => this.guild.roles.set(role.id, role))
              .concatMap((role) => this.autoRoleService.addJoinRole(this.guild, role))
              .toArray()
              .subscribe(() => done(), (error) => done(error));
          });

          it('adds a "Join Roles" field, with a list of all assigned roles', function (done) {
            this.listRoles.run(this.context)
              .flatMap((response) => response.embed.fields)
              .find((field) => field.name === 'Join Roles')
              .do((field) => expect(field.value).to.eq('Role1, Role2, Role3'))
              .subscribe(() => done(), (error) => done(error));
          });
        });
      });
    });
  });
});
