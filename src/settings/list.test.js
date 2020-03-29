const {from} = require('rxjs');
const {tap, toArray, flatMap, concatMap, find, count} = require('rxjs/operators');
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

  it('emits a single response', function (done) {
    this.runTest$().pipe(
      count(() => true),
      tap((count) => expect(count).to.equal(1)),
    ).subscribe(() => done(), (error) => done(error));
  });

  it('emits an embed', function (done) {
    this.runTest$().pipe(
      tap((response) => expect(response).to.have.property('embed')),
    ).subscribe(() => done(), (error) => done(error));
  });

  describe('roles list', function () {
    it('has section for the join roles', function (done) {
      this.runTest$().pipe(
        flatMap((response) => response.embed.fields),
        find((field) => field.name === 'Join Roles'),
        tap((field) => expect(field).to.not.be.undefined),
      ).subscribe(() => done(), (error) => done(error));
    });

    describe('join roles', function () {
      context('when there are no roles on the list', function () {
        it('adds a "Join Roles" field, with an empty list', function (done) {
          this.runTest$().pipe(
            flatMap((response) => response.embed.fields),
            find((field) => field.name === 'Join Roles'),
            tap((field) => expect(field.value).to.eq('[None]')),
          ).subscribe(() => done(), (error) => done(error));
        });
      });

      context('when there are roles on the list', function () {
        beforeEach(function (done) {
          this.roles = [
            {id: '0000-role-1', name: 'Role1'},
            {id: '0000-role-2', name: 'Role2'},
            {id: '0000-role-3', name: 'Role3'},
          ];

          from(this.roles).pipe(
            tap((role) => this.guild.roles.set(role.id, role)),
            concatMap((role) => this.autoRoleService.addJoinRole(this.guild, role)),
            toArray(),
          ).subscribe(() => done(), (error) => done(error));
        });

        it('adds a "Join Roles" field, with a list of all assigned roles', function (done) {
          this.runTest$().pipe(
            flatMap((response) => response.embed.fields),
            find((field) => field.name === 'Join Roles'),
            tap((field) => expect(field.value).to.eq('Role1, Role2, Role3')),
          ).subscribe(() => done(), (error) => done(error));
        });
      });
    });
  });
});
