const Collection = require('discord.js').Collection;
const ConfigAction = require('chaos-core').ConfigAction;
const ChaosCore = require("chaos-core");

const AutoRoleService = require('../../services/auto-role-service');
const addJoinRole = require('../../settings/add-join-role');

describe('!settings autoRole addJoinRole {role}', function () {
  beforeEach(function () {
    this.chaos = ChaosCore.test.createChaosStub();
    this.autoRoleService = new AutoRoleService(this.chaos);

    this.chaos.stubService('autoRoles', 'AutoRoleService', this.autoRoleService);

    this.addJoinRole = new ConfigAction(addJoinRole);
    this.addJoinRole.chaos = this.chaos;

    this.addJoinRole.onListen();
  });

  context('#onListen', function () {
    it('loads the AutoRoleService', function () {
      expect(this.addJoinRole.autoRoleService).to.eq(this.autoRoleService);
    });
  });

  describe('#run', function () {
    beforeEach(function () {
      this.guild = {
        id: '22222',
        name: 'Test Guild',
        roles: new Collection(),
      };

      this.role = {id: '11111', name: 'Role1'};

      this.context = {
        guild: this.guild,
        inputs: {
          role: this.role.id,
        },
      };
    });

    context('when a role is not given', function () {
      beforeEach(function () {
        this.context.inputs.role = undefined;
      });

      it('emits an error message', function (done) {
        this.addJoinRole.run(this.context)
          .toArray()
          .do((emitted) => {
            expect(emitted).to.deep.equal([
              {
                status: 400,
                content: 'The name of a role to assign is required',
              },
            ]);
          })
          .subscribe(() => done(), (error) => done(error));
      });
    });

    context('when the role is already on the list', function () {
      beforeEach(function (done) {
        this.guild.roles.set(this.role.id, this.role);

        this.autoRoleService.addJoinRole(this.guild, this.role)
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('emits an error message', function (done) {
        this.addJoinRole.run(this.context)
          .toArray()
          .do((emitted) => {
            expect(emitted).to.deep.equal([
              {
                status: 400,
                message: 'That role is already being granted to new users.',
              },
            ]);
          })
          .subscribe(() => done(), (error) => done(error));
      });
    });

    [
      {type: 'a mention', value: '<@&11111>'},
      {type: 'a name', value: 'Role1'},
      {type: 'an id', value: '11111'},
    ].forEach((input) => {
      context(`when a role is given as ${input.type}`, function () {
        beforeEach(function () {
          this.context.inputs.role = input.value;
        });

        context('when the role exists in the guild', function () {
          beforeEach(function () {
            this.guild.roles.set(this.role.id, this.role);
          });

          it('adds the correct role to the list', function (done) {
            sinon.spy(this.autoRoleService, 'addJoinRole');

            this.addJoinRole.run(this.context)
              .toArray()
              .do(() => {
                expect(this.autoRoleService.addJoinRole)
                  .to.have.been.calledWith(this.guild, this.role);
              })
              .subscribe(() => done(), (error) => done(error));
          });

          it('emits a success message', function (done) {
            this.addJoinRole.run(this.context)
              .toArray()
              .do((emitted) => {
                expect(emitted).to.deep.equal([
                  {
                    status: 200,
                    content: 'the role Role1 will be granted to users when they join',
                  },
                ]);
              })
              .subscribe(() => done(), (error) => done(error));
          });
        });

        context('when the role does not exist in the guild', function () {
          it('emits an error message', function (done) {
            this.addJoinRole.run(this.context)
              .toArray()
              .do((emitted) => {
                expect(emitted).to.deep.equal([
                  {
                    status: 404,
                    content: `The role '${input.value}' could not be found.`,
                  },
                ]);
              })
              .subscribe(() => done(), (error) => done(error));
          });
        });
      });
    });
  });
});
