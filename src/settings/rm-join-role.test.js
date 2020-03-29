const {tap} = require('rxjs/operators');
const Collection = require('discord.js').Collection;
const ChaosCore = require("chaos-core");

const AutoRolesPlugin = require('../plugin');

describe('!config autoRole rmJoinRole {role}', function () {
  beforeEach(function (done) {
    this.chaos = ChaosCore.test.createChaosStub();
    this.chaos.addPlugin(AutoRolesPlugin);
    this.autoRoleService = this.chaos.getService('autoRoles', 'AutoRoleService');

    this.guild = {
      id: '22222',
      name: 'Test Guild',
      roles: new Collection(),
    };

    this.message = {guild: this.guild};
    this.role = {id: '11111', name: 'Role1'};
    this.args = {role: this.role.id};

    this.runTest$ = () => this.chaos.testConfigAction({
      pluginName: 'autoRoles',
      actionName: 'rmJoinRole',
      message: this.message,
      args: this.args,
    });

    this.autoRoleService
      .addJoinRole(this.guild, this.role)
      .subscribe(() => done(), (error) => done(error));
  });

  context('when a role is not given', function () {
    beforeEach(function () {
      this.args.role = undefined;
    });

    it('emits an error message', function (done) {
      this.runTest$().pipe(
        tap((response) => {
          expect(response).to.containSubset({
            "content": "I'm sorry, but I'm missing some information for that command:",
            "status": 400,
          });
        }),
      ).subscribe(() => done(), (error) => done(error));
    });
  });

  context('when the role is not on the list', function () {
    beforeEach(function (done) {
      this.guild.roles.set(this.role.id, this.role);

      this.autoRoleService.removeJoinRole(this.guild, this.role)
        .subscribe(() => {}, (error) => done(error), () => done());
    });

    it('emits an error message', function (done) {
      this.runTest$().pipe(
        tap((response) => {
          expect(response).to.deep.equal({
            status: 400,
            message: 'That role is not on the list.',
          });
        }),
      ).subscribe(() => done(), (error) => done(error));
    });
  });

  [
    {type: 'a mention', value: '<@&11111>'},
    {type: 'a name', value: 'Role1'},
    {type: 'an id', value: '11111'},
  ].forEach((input) => {
    context(`when a role is given as ${input.type}`, function () {
      beforeEach(function () {
        this.args.role = input.value;
      });

      context('when the role exists in the guild', function () {
        beforeEach(function () {
          this.guild.roles.set(this.role.id, this.role);
        });

        it('adds the correct role to the list', function (done) {
          sinon.spy(this.autoRoleService, 'removeJoinRole');

          this.runTest$().pipe(
            tap(() => {
              expect(this.autoRoleService.removeJoinRole)
                .to.have.been.calledWith(this.guild, this.role);
            }),
          ).subscribe(() => done(), (error) => done(error));
        });

        it('emits a success message', function (done) {
          this.runTest$().pipe(
            tap((response) => {
              expect(response).to.deep.equal({
                status: 200,
                content: 'the role Role1 has been removed from the list.',
              });
            }),
          ).subscribe(() => done(), (error) => done(error));
        });
      });

      context('when the role does not exist in the guild', function () {
        it('emits an error message', function (done) {
          this.runTest$().pipe(
            tap((response) => {
              expect(response).to.deep.equal({
                status: 404,
                content: `The role '${input.value}' could not be found.`,
              });
            }),
          ).subscribe(() => done(), (error) => done(error));
        });
      });
    });
  });
});
