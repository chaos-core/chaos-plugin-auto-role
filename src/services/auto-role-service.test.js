const ChaosCore = require('chaos-core');

const AutoRoleService = require('./auto-role-service');
const DataKeys = require('../lib/data-keys');

const {
  RoleAlreadyAddedError,
  RoleNotAddedError,
} = require('../lib/errors');

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
      beforeEach(async function () {
        await this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, []).toPromise();
      });

      it('returns an empty array', async function () {
        const roleIds = await this.autoRoleService.getJoinRoleIds(this.guild);
        expect(roleIds).to.deep.equal([]);
      });
    });

    context('when there are roles', function () {
      beforeEach(async function () {
        this.roleIds = [
          '0000-role-1',
          '0000-role-2',
          '0000-role-3',
        ];

        await this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, this.roleIds).toPromise();
      });

      it('returns an array of role ids', async function () {
        const roleIds = await this.autoRoleService.getJoinRoleIds(this.guild);
        expect(roleIds).to.deep.equal(this.roleIds);
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

    it('it saves the role id list', async function () {
      await this.autoRoleService.setJoinRoleIds(this.guild, this.roleIds);
      const roleIds = await this.chaos.getGuildData(this.guild.id, DataKeys.JoinRoles).toPromise();
      expect(roleIds).to.deep.equal(this.roleIds);
    });
  });

  describe('#getJoinRoles', function () {
    context('when there are no roles', function () {
      beforeEach(async function () {
        await this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, []).toPromise();
      });

      it('emits an empty array', async function () {
        const roleIds = await this.autoRoleService.getJoinRoles(this.guild);
        expect(roleIds).to.deep.equal([]);
      });
    });

    context('when there are roles', function () {
      beforeEach(async function () {
        this.roles = [
          {id: '0000-role-1', name: 'Role1'},
          {id: '0000-role-2', name: 'Role2'},
          {id: '0000-role-3', name: 'Role3'},
        ];

        this.roles.forEach((role) => this.guild.roles.set(role.id, role));

        await this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, this.roles.map((role) => role.id)).toPromise();
      });

      it('emits an array of roles for each id', async function () {
        const roleIds = await this.autoRoleService.getJoinRoles(this.guild);
        expect(roleIds).to.deep.equal(this.roles);
      });

      context('when not all roles exist in the guild', function () {
        beforeEach(function () {
          this.guild.roles.delete(this.roles[0].id);
        });

        it('emits an array of roles that were found', async function () {
          const roleIds = await this.autoRoleService.getJoinRoles(this.guild);
          expect(roleIds).to.deep.equal(this.roles.slice(1));
        });
      });
    });
  });

  describe('#addJoinRole', function () {
    beforeEach(function () {
      this.role = {id: '00000-role-1', name: 'role-1'};
    });

    it('it updates the join role list', async function () {
      await this.autoRoleService.addJoinRole(this.guild, this.role);
      const roleIds = await this.chaos.getGuildData(this.guild.id, DataKeys.JoinRoles).toPromise();
      expect(roleIds).to.deep.equal([this.role.id]);
    });

    context('when there are other roles on the list', function () {
      beforeEach(async function () {
        this.preExistingRole = {id: '00000-role-2', name: 'role-2'};
        await this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, [this.preExistingRole.id]).toPromise();
      });

      it('appends the role to the list', async function () {
        await this.autoRoleService.addJoinRole(this.guild, this.role);
        const roleIds = await this.chaos.getGuildData(this.guild.id, DataKeys.JoinRoles).toPromise();
        expect(roleIds).to.deep.equal([
          this.preExistingRole.id,
          this.role.id,
        ]);
      });
    });

    context('when the role is already on the list', function () {
      beforeEach(async function () {
        await this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, [this.role.id]).toPromise();
      });

      it('throws an RoleAlreadyAddedError', async function () {
        try {
          await this.autoRoleService.addJoinRole(this.guild, this.role);
        } catch (error) {
          expect(error).to.be.an.instanceof(RoleAlreadyAddedError);
          return;
        }

        throw new Error('Expected an error to be thrown.');
      });
    });
  });

  describe('#removeJoinRole', function () {
    beforeEach(async function () {
      this.role = {id: '00000-role-1', name: 'role-1'};
      await this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, [this.role.id]).toPromise();
    });

    it('it updates the join role list', async function () {
      await this.autoRoleService.removeJoinRole(this.guild, this.role);
      const roleIds = await this.chaos.getGuildData(this.guild.id, DataKeys.JoinRoles).toPromise();
      expect(roleIds).to.deep.equal([]);
    });

    context('when there are other roles on the list', function () {
      beforeEach(async function () {
        this.preExistingRole = {id: '00000-role-2', name: 'role-2'};
        await this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, [this.role.id, this.preExistingRole.id]).toPromise();
      });

      it('appends the role to the list', async function () {
        await this.autoRoleService.removeJoinRole(this.guild, this.role);
        const roleIds = await this.chaos.getGuildData(this.guild.id, DataKeys.JoinRoles).toPromise();
        expect(roleIds).to.deep.equal([this.preExistingRole.id]);
      });
    });

    context('when the role is not on the list', function () {
      beforeEach(async function () {
        await this.chaos.setGuildData(this.guild.id, DataKeys.JoinRoles, []).toPromise();
      });

      it('throws an RoleNotAddedError', async function () {
        try {
          await this.autoRoleService.removeJoinRole(this.guild, this.role);
        } catch (error) {
          expect(error).to.be.an.instanceof(RoleNotAddedError);
          return;
        }

        throw new Error('Expected an error to be thrown.');
      });
    });
  });
})
;
