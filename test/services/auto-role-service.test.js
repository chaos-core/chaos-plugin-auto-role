const Rx = require('rx');
const ChaosCore = require('chaos-core');

const AutoRoleService = require('../../services/auto-role-service');
const DataKeys = require('../../lib/data-keys');

const {
  RoleAlreadyAddedError,
  RoleNotAddedError,
} = require('../../errors');

describe('AutoRoleService', function () {
  beforeEach(function () {
    this.chaos = ChaosCore.test.createChaosStub();
    this.autoRoleService = new AutoRoleService(this.chaos);

    this.guild = {
      id: '0000-guild-1',
      name: 'Test Guild',
      roles: new Map(),
    };
  });

  describe('#getJoinRoleIds', function () {
    context('when there are no roles', function () {
      beforeEach(function (done) {
        this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, [])
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('emits an empty array', function (done) {
        this.autoRoleService.getJoinRoleIds(this.guild)
          .toArray()
          .do((emitted) => {
            expect(emitted).to.deep.equal([
              [],
            ]);
          })
          .subscribe(() => done(), (error) => done(error));
      });
    });

    context('when there are roles', function () {
      beforeEach(function (done) {
        this.roleIds = [
          '0000-role-1',
          '0000-role-2',
          '0000-role-3',
        ];

        this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, this.roleIds)
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('emits an array of role ids', function (done) {
        this.autoRoleService.getJoinRoleIds(this.guild)
          .toArray()
          .do((emitted) => {
            expect(emitted).to.deep.equal([
              this.roleIds,
            ]);
          })
          .subscribe(() => done(), (error) => done(error));
      });
    });
  });

  describe('#setJoinRoleIds', function () {
    beforeEach(function () {
      this.roleIds = [
        '0000-role-1',
        '0000-role-2',
        '0000-role-3',
      ];
    });

    it('it saves the role id list', function (done) {
      this.autoRoleService.setJoinRoleIds(this.guild, this.roleIds)
        .flatMap(() => this.chaos.getGuildData(this.guild.id, DataKeys.JoinRoles))
        .toArray()
        .do((emitted) => {
          expect(emitted).to.deep.equal([
            this.roleIds,
          ]);
        })
        .subscribe(() => done(), (error) => done(error));

      expect(stream$).to.emit([this.roleIds]).and.complete(done);
    });
  });

  describe('#getJoinRoles', function () {
    context('when there are no roles', function () {
      beforeEach(function (done) {
        this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, [])
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('emits an empty array', function (done) {
        this.autoRoleService.getJoinRoles(this.guild)
          .toArray()
          .do((emitted) => {
            expect(emitted).to.deep.equal([
              [],
            ]);
          })
          .subscribe(() => done(), (error) => done(error));
      });
    });

    context('when there are roles', function () {
      beforeEach(function (done) {
        this.roles = [
          {id: '0000-role-1', name: 'Role1'},
          {id: '0000-role-2', name: 'Role2'},
          {id: '0000-role-3', name: 'Role3'},
        ];

        this.roles.forEach((role) => this.guild.roles.set(role.id, role));

        this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, this.roles.map((role) => role.id))
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('emits an array of roles for each id', function (done) {
        this.autoRoleService.getJoinRoles(this.guild)
          .toArray()
          .do((emitted) => {
            expect(emitted).to.deep.equal([
              this.roles,
            ]);
          })
          .subscribe(() => done(), (error) => done(error));
      });

      context('when not all roles exist in the guild', function () {
        beforeEach(function () {
          this.guild.roles.delete(this.roles[0].id);
        });

        it('emits an array of roles that were found', function (done) {
          this.autoRoleService.getJoinRoles(this.guild)
            .toArray()
            .do((emitted) => {
              expect(emitted).to.deep.equal([
                this.roles.slice(1),
              ]);
            })
            .subscribe(() => done(), (error) => done(error));
        });
      });
    });
  });

  describe('#addJoinRole', function () {
    beforeEach(function () {
      this.role = {id: '00000-role-1', name: 'role-1'};
    });

    it('it updates the join role list', function (done) {
      this.autoRoleService.addJoinRole(this.guild, this.role)
        .flatMap(() => this.chaos.getGuildData(this.guild.id, DataKeys.JoinRoles))
        .toArray()
        .do((emitted) => {
          expect(emitted).to.deep.equal([
            [this.role.id],
          ]);
        })
        .subscribe(() => done(), (error) => done(error));
    });

    context('when there are other roles on the list', function () {
      beforeEach(function (done) {
        this.preExistingRole = {id: '00000-role-2', name: 'role-2'};

        this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, [this.preExistingRole.id])
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('appends the role to the list', function (done) {
        this.autoRoleService.addJoinRole(this.guild, this.role)
          .flatMap(() => this.chaos.getGuildData(this.guild.id, DataKeys.JoinRoles))
          .toArray()
          .do((emitted) => {
            expect(emitted).to.deep.equal([
              [
                this.preExistingRole.id,
                this.role.id,
              ],
            ]);
          })
          .subscribe(() => done(), (error) => done(error));
      });
    });

    context('when the role is already on the list', function () {
      beforeEach(function (done) {
        this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, [this.role.id])
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('throws an RoleAlreadyAddedError', function (done) {
        this.autoRoleService.addJoinRole(this.guild, this.role)
          .do(() => { throw new Error('Expected an error to be thrown.'); })
          .catch((error) => {
            expect(error).to.be.an.instanceof(RoleAlreadyAddedError);
            return Rx.Observable.return(true);
          })
          .subscribe(() => done(), (error) => done(error));
      });
    });
  });

  describe('#removeJoinRole', function () {
    beforeEach(function (done) {
      this.role = {id: '00000-role-1', name: 'role-1'};

      this.chaos
        .setGuildData(this.guild.id, DataKeys.JoinRoles, [this.role.id])
        .subscribe(() => {}, (error) => done(error), () => done());
    });

    it('it updates the join role list', function (done) {
      this.autoRoleService.removeJoinRole(this.guild, this.role)
        .flatMap(() => this.chaos.getGuildData(this.guild.id, DataKeys.JoinRoles))
        .toArray()
        .do((emitted) => {
          expect(emitted).to.deep.equal([
            [],
          ]);
        })
        .subscribe(() => done(), (error) => done(error));
    });

    context('when there are other roles on the list', function () {
      beforeEach(function (done) {
        this.preExistingRole = {id: '00000-role-2', name: 'role-2'};

        this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, [this.role.id, this.preExistingRole.id])
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('appends the role to the list', function (done) {
        this.autoRoleService.removeJoinRole(this.guild, this.role)
          .flatMap(() => this.chaos.getGuildData(this.guild.id, DataKeys.JoinRoles))
          .toArray()
          .do((emitted) => {
            expect(emitted).to.deep.equal([
              [
                this.preExistingRole.id,
              ],
            ]);
          })
          .subscribe(() => done(), (error) => done(error));
      });
    });

    context('when the role is not on the list', function () {
      beforeEach(function (done) {
        this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, [])
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('throws an RoleNotAddedError', function (done) {
        this.autoRoleService.removeJoinRole(this.guild, this.role)
          .do(() => { throw new Error('Expected an error to be thrown.'); })
          .catch((error) => {
            expect(error).to.be.an.instanceof(RoleNotAddedError);
            return Rx.Observable.return(true);
          })
          .subscribe(() => done(), (error) => done(error));
      });
    });
  });
});
