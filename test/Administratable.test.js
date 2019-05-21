
const { ASSERT_EQ, EXPECT_EXCEPT, EXPECT_NOEXCEPT } = require('./helpers/assertion');
const Administratable = artifacts.require('Administratable');

function is_undefined(value) {
  var _l_u = void(0);
  return value == _l_u;
}

function test_log(msg) {
  console.log(msg);
}

contract('TEST_Administratable', (accounts) => {
  test_log("    accounts[0] : " + accounts[0]);
  test_log("    accounts[1] : " + accounts[1]);
  test_log("    accounts[2] : " + accounts[2]);

  beforeEach(async function () {
    this.administratable = await Administratable.new({from: accounts[0]});
  });

  describe('addSuperAdmin', () => {
    it('assert initial state', async function () {
      // accounts are not super admin
      ASSERT_EQ( "owner", await this.administratable.owner(),accounts[0]);
      ASSERT_EQ( "superadmin[0]", await this.administratable.superAdmins(accounts[0]),false);
      if ( !is_undefined( accounts[1] ) ) {
        ASSERT_EQ( "superadmin[1]", await this.administratable.superAdmins(accounts[1]),false);
        ASSERT_EQ( "superadmin[2]", await this.administratable.superAdmins(accounts[2]),false);
      }
    });

    it('contract owner can add a super Admin', async function () {
      // account[0] is the contract owner so can add superAdmin
      await this.administratable.addSuperAdmin(accounts[1], {from: accounts[0]});

      // accounts[1] is now a super admin
      ASSERT_EQ( "superadmin[1]", await this.administratable.superAdmins(accounts[1]),true);
    });

    it('a super admin can not add another super admin', async function () {
      await this.administratable.addSuperAdmin(accounts[1], {from: accounts[0]});
      ASSERT_EQ( "superadmin[1]", await this.administratable.superAdmins(accounts[1]),true);

      // this should fail because accounts[1] is not the owner
      await EXPECT_EXCEPT("revert",
        this.administratable.addSuperAdmin(accounts[2], {from: accounts[1]})
      );
      ASSERT_EQ( "superadmin[2]", await this.administratable.superAdmins(accounts[2]),false);
    });

    it('a non super admin cannot add another super admin', async function () {
      ASSERT_EQ( "superadmin[1]", await this.administratable.superAdmins(accounts[1]),false);

      // this should fail because accounts[1] is not the onwer and a super admin
      await EXPECT_EXCEPT("revert",
        this.administratable.addSuperAdmin(accounts[1], {from: accounts[2]})
      );
      ASSERT_EQ( "superadmin[2]", await this.administratable.superAdmins(accounts[2]),false);
    });

    it('cannot add a super admin that is already a super admin', async function () {
      await this.administratable.addSuperAdmin(accounts[1], {from: accounts[0]});

      // second call fails
      await EXPECT_EXCEPT("revert",
        this.administratable.addSuperAdmin(accounts[1], {from: accounts[0]})
      );
    });
  });

  describe('removeSuperAdmin', () => {
    it('contract owner can remove a super Admin', async function () {
      // accounts[1] is not a super admin
      ASSERT_EQ( "superadmin[1]", await this.administratable.superAdmins(accounts[1]),false);

      // account[0] is the contract owner so can add superAdmin
      await this.administratable.addSuperAdmin(accounts[1], {from: accounts[0]});

      // accounts[1] is now a super admin
      ASSERT_EQ( "superadmin[1]", await this.administratable.superAdmins(accounts[1]),true);

      // account[0] is the contract owner so can add superAdmin
      await this.administratable.removeSuperAdmin(accounts[1], {from: accounts[0]});

      // accounts[1] is now a super admin
      ASSERT_EQ( "superadmin[1]", await this.administratable.superAdmins(accounts[1]),false);
    });

    it('a super admin can not remove another super admin', async function () {
      // this should fail because accounts[1] is not a super admin

      // accounts[1] is not a super admin
      ASSERT_EQ( "superadmin[1]", await this.administratable.superAdmins(accounts[1]),false);
      await this.administratable.addSuperAdmin(accounts[1], {from: accounts[0]});
      ASSERT_EQ( "superadmin[1]", await this.administratable.superAdmins(accounts[1]),true);

      ASSERT_EQ( "superadmin[2]", await this.administratable.superAdmins(accounts[2]),false);
      await this.administratable.addSuperAdmin(accounts[2], {from: accounts[0]});
      ASSERT_EQ( "superadmin[2]", await this.administratable.superAdmins(accounts[2]),true);

      // try to re-add [2] who is a super admin already
      await EXPECT_EXCEPT("revert",
        this.administratable.addSuperAdmin(accounts[2], {from: accounts[0]})
      );

      // try to remove [2] by non-owner [1]
      await EXPECT_EXCEPT("revert",
        this.administratable.removeSuperAdmin(accounts[2], {from: accounts[1]})
      );

      // try to remove [3] who is not a super admin
      await EXPECT_EXCEPT("revert",
        this.administratable.removeSuperAdmin(accounts[3], {from: accounts[0]})
      );

      await EXPECT_EXCEPT("revert",
        this.administratable.removeSuperAdmin(this.administratable.address)
      );
    });

    it('a non super admin cannot remove a super admin', async function () {
      this.administratable.addSuperAdmin(accounts[1], {from: accounts[0]})
      ASSERT_EQ( "superadmin[1]", await this.administratable.superAdmins(accounts[1]),true);
      ASSERT_EQ( "superadmin[2]", await this.administratable.superAdmins(accounts[2]),false);

      // this should fail because accounts[1] is not a super admin
      await EXPECT_EXCEPT("revert",
        this.administratable.removeSuperAdmin(accounts[1], {from: accounts[2]})
      );
      ASSERT_EQ( "superadmin[1]", await this.administratable.superAdmins(accounts[1]),true);
    });

    it('cannot remove a super admin that is not a super admin', async function () {
      ASSERT_EQ( "superadmin[1]", await this.administratable.superAdmins(accounts[1]),false);
      await EXPECT_EXCEPT("revert",
        this.administratable.removeSuperAdmin(accounts[1], {from: accounts[0]})
      );
      ASSERT_EQ( "superadmin[1]", await this.administratable.superAdmins(accounts[1]),false);
    });
  });
});

