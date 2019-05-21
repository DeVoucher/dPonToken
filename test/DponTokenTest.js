const { ASSERT_EQ, EXPECT_EXCEPT, EXPECT_NOEXCEPT } = require('./helpers/assertion');

const DponToken = artifacts.require('DponToken');
const BigNumber = web3.utils.BN;

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const ADVISOR_LOCKUP_END = new BigNumber(1575075601);
const TEAM_LOCKUP_END = new BigNumber(1588294801);

const NAME = "DponToken";
const SYMBOL = "DPON";
const DECIMALS = 18;
const INITIAL_SUPPLY = 10000;

function test_log(msg) {
//  console.log(msg);
}

contract('TEST_DponToken', function(accounts) {
  test_log("    accounts[0] : " + accounts[0]);
  test_log("    accounts[1] : " + accounts[1]);
  test_log("    accounts[2] : " + accounts[2]);
/*
  accounts[1] = '0xf40a4e21622e20c541e21f34be7af27d2a9db0c6';
  accounts[2] = '0x91708ad4be34189ec174f01061e9d8eb7de1fb5a';
  await web3.eth.sendTransaction({from:accounts[0], to:accounts[1], value:"0x10000000"});
  await web3.eth.sendTransaction({from:accounts[0], to:accounts[2], value:"0x10000000"});
  await web3.eth.personal.unlockAccount("0xf40a4e21622e20c541e21f34be7af27d2a9db0c6", "1234", 0);
  await web3.eth.personal.unlockAccount("0x91708ad4be34189ec174f01061e9d8eb7de1fb5a", "1234", 0);
*/

  beforeEach(async function () {
    dponToken = await DponToken.new(
      // set accounts[1] to be registry
      NAME, SYMBOL, DECIMALS, INITIAL_SUPPLY, accounts[1]
    );
  });

  describe('constructor', () => {
    it('validate token minting', async function () {
      // accounts[0] should be the owner
      //let rst = await dponToken.owner();
      //assert.qual(rst, accounts[0], "the owner should be accounts[0]");

      // accounts[0] should be the owner
      ASSERT_EQ( "token owner ", await dponToken.owner(), accounts[0] );

      // total supply should be initial supply
      ASSERT_EQ( "total supply", await dponToken.totalSupply(), INITIAL_SUPPLY );

      // balance of register (accounts[1]) should be initial_supply
      ASSERT_EQ( "balances[0] ", await dponToken.balanceOf(accounts[0]), 0 );
      ASSERT_EQ( "balances[1] ", await dponToken.balanceOf(accounts[1]), INITIAL_SUPPLY );

      // accounts[1] should be a super admin
      ASSERT_EQ( "superadmin[0]", await dponToken.superAdmins(accounts[0]), false );
      ASSERT_EQ( "superadmin[1]", await dponToken.superAdmins(accounts[1]), true );
      ASSERT_EQ( "superadmin[2]", await dponToken.superAdmins(accounts[2]), false );
    });

    it('owner mintable', async function () {
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 0 );
      await dponToken.mint(accounts[2], 6000, {from: accounts[0]});
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 6000 );
    });

    it('register non-mintable', async function () {
      ASSERT_EQ( "balances[3] ", await dponToken.balanceOf(accounts[3]), 0 );
      await EXPECT_EXCEPT("revert", dponToken.mint(accounts[3], 6000, {from: accounts[1]}));
      ASSERT_EQ( "balances[3] ", await dponToken.balanceOf(accounts[3]), 0 );
    });

    it('user non-mintable', async function () {
      ASSERT_EQ( "balances[3] ", await dponToken.balanceOf(accounts[3]), 0 );
      await EXPECT_EXCEPT("revert", dponToken.mint(accounts[3], 6000, {from: accounts[3]}));
      ASSERT_EQ( "balances[3] ", await dponToken.balanceOf(accounts[3]), 0 );
    });
  });

  describe('transfer', () => {
    it('simple transfer case should succeed and change balance', async function () {
      // transfer tokens from registry (accounts[1]) to another account
      ASSERT_EQ( "balances[1] ", await dponToken.balanceOf(accounts[1]), INITIAL_SUPPLY );
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 0 );

      // perform transfer
      test_log( "    transfer [1]->[2]: 5000" );
      await EXPECT_NOEXCEPT(dponToken.transfer(accounts[2], 5000, {from: accounts[1]}));

      // balances should be updated
      ASSERT_EQ( "balances[1] ", await dponToken.balanceOf(accounts[1]), INITIAL_SUPPLY-5000 );
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 5000 );
    });

    it('transferFrom case should succeed and change balance', async function () {
      // transfer tokens from registry (accounts[1]) to another account
      ASSERT_EQ( "balances[1] ", await dponToken.balanceOf(accounts[1]), INITIAL_SUPPLY );
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 0 );

      // perform transfer
      test_log( "    transfer [1]->[2]: 5000" );
      await EXPECT_NOEXCEPT(dponToken.transfer(accounts[2], 5000, {from: accounts[1]}));
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 5000 );

      const spender = accounts[3];
      test_log( "    approve  [2]->[3]: 1000" );
      await EXPECT_NOEXCEPT(dponToken.approve(spender, 1000, { from: accounts[2] }));
      ASSERT_EQ("allowance[2]->[3]", await dponToken.allowance(accounts[2], spender), 1000 );

      test_log( "    transfer [2]->[3] by [3]: 1000" );
      await EXPECT_NOEXCEPT(dponToken.transferFrom(accounts[2], accounts[3], 1000, { from: spender }));

      // balances should be updated
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 4000 );
      ASSERT_EQ( "balances[3] ", await dponToken.balanceOf(accounts[3]), 1000 );
    });

    it('transfer fails when token is frozen', async function () {
      test_log( "    transfer [1]->[2]: 5000" );
      await EXPECT_NOEXCEPT(dponToken.transfer(accounts[2], 5000, {from: accounts[1]}));
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 5000 );

      // freeze token
      test_log( "    freeze token" );
      await dponToken.freezeToken(true, {from: accounts[1]});
      ASSERT_EQ( "is frozen token", await dponToken.frozenToken(), true );

      // perform transfer
      test_log( "    transfer [1]->[2]: 1000" );
      await EXPECT_EXCEPT("revert", dponToken.transfer(accounts[2], 1000, {from: accounts[1]}));
      test_log( "    transfer [2]->[3]: 1000" );
      await EXPECT_EXCEPT("revert", dponToken.transfer(accounts[3], 1000, {from: accounts[2]}));
    });

    it('transfer fails if sender is frozen', async function () {
      test_log( "    transfer [1]->[2]: 5000" );
      await EXPECT_NOEXCEPT(dponToken.transfer(accounts[2], 5000, {from: accounts[1]}));
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 5000 );

      // freeze accounts[1]
      test_log( "    freeze accounts[1]" );
      await dponToken.freezeAccount(accounts[1], true, {from: accounts[1]});

      // perform transfer
      test_log( "    transfer [1]->[2]: 1000" );
      await EXPECT_EXCEPT("revert", dponToken.transfer(accounts[2], 1000, {from: accounts[1]}));
      test_log( "    transfer [2]->[3]: 1000" );
      await EXPECT_NOEXCEPT(dponToken.transfer(accounts[3], 1000, {from: accounts[2]}));
    });

    it('transfer fails if destination is frozen', async function () {
      // freeze accounts[2]
      test_log( "    freeze accounts[2]" );
      await dponToken.freezeAccount(accounts[2], true, {from: accounts[1]});

      // perform transfer
      test_log( "    transfer [1]->[2]: 1000" );
      await EXPECT_EXCEPT("revert", dponToken.transfer(accounts[2], 5000, {from: accounts[1]}));
    });

    it('transfer fails if destination is not a valid address', async function () {
      test_log( "    transfer [1]->0: 100" );
      await EXPECT_EXCEPT("revert", dponToken.transfer(ZERO_ADDRESS, 100, {from: accounts[1]}));
    });

    it('when the spender is the frozen account', async function () {
      const amount = 100;
      const spender = accounts[2];

      test_log( "    freeze accounts[1]" );
      await dponToken.freezeAccount(accounts[1], true, {from: accounts[0]});

      // this should fail because accounts[1] is frozen account
      test_log( "    approve  [1]->[2]: " + amount );
      await EXPECT_EXCEPT("revert", dponToken.approve(spender, amount, { from: accounts[1] }));
    });

    it('when the spender is the frozen token', async function () {
      const amount = 100;
      const spender = accounts[2];

      // this should fail because accounts[1] is frozen account
      test_log( "    freeze token" );
      await dponToken.freezeToken(true, {from: accounts[0]});
      ASSERT_EQ( "is frozen token", await dponToken.frozenToken(), true );

      test_log( "    approve  [1]->[2]: " + amount );
      await EXPECT_EXCEPT("revert", dponToken.approve(spender, amount, { from: accounts[1] }));
      test_log( "    transfer [1]->[3] by [2]: " + amount );
      await EXPECT_EXCEPT("revert", dponToken.transferFrom(accounts[1], accounts[3], amount, { from: spender }));

      test_log( "    unfreeze token" );
      await dponToken.freezeToken(false, {from: accounts[0]});
      ASSERT_EQ( "is frozen token", await dponToken.frozenToken(), false );

      test_log( "    approve  [1]->[2]: " + amount );
      await EXPECT_NOEXCEPT(dponToken.approve(spender, amount, { from: accounts[1] }));
      test_log( "    freeze token" );
      await dponToken.freezeToken(true, {from: accounts[0]});
      ASSERT_EQ( "is frozen token", await dponToken.frozenToken(), true );
      test_log( "    transfer [1]->[3] by [2]: " + amount );
      await EXPECT_EXCEPT("revert", dponToken.transferFrom(accounts[1], accounts[3], amount, { from: spender }));
    });

    it('when the spender is the frozen account(message sender)', async function () {
      const amount = 100;
      const spender = accounts[2];

      test_log( "    freeze accounts[1]" );
      await dponToken.freezeAccount(accounts[1], true, {from: accounts[0]});

      test_log( "    approve  [1]->[2]: " + amount );
      await EXPECT_EXCEPT("revert", dponToken.approve(spender, amount, { from: accounts[1] }));
      test_log( "    transfer [1]->[3] by [2]: " + amount );
      await EXPECT_EXCEPT("revert", dponToken.transferFrom(accounts[1], accounts[3], amount, { from: spender }));

      test_log( "    unfreeze accounts[1]" );
      await dponToken.freezeAccount(accounts[1], false, {from: accounts[0]});

      test_log( "    approve  [1]->[2]: " + amount );
      await dponToken.approve(spender, amount, { from: accounts[1] });
      test_log( "    freeze accounts[1]" );
      await dponToken.freezeAccount(accounts[1], true, {from: accounts[0]});
      test_log( "    transfer [1]->[3] by [2]: " + amount );
      await EXPECT_EXCEPT("revert", dponToken.transferFrom(accounts[1], accounts[3], amount, { from: spender }));
    });

    it('increase allowance', async function () {
      const amount = 100;
      const spender = accounts[2];
      const increasedAmount = 200;

      test_log( "    approve  [1]->[2]: " + amount );
      await dponToken.approve(spender, amount, { from: accounts[1] });
      ASSERT_EQ("allowance[1]->[2]", await dponToken.allowance(accounts[1], spender), amount );

      test_log( "    increase allowance [1]->[2]: " + amount );
      await dponToken.increaseAllowance(spender, amount, { from: accounts[1] });
      ASSERT_EQ("allowance[1]->[2]", await dponToken.allowance(accounts[1], spender), increasedAmount );
    });

    it('decrease allowance', async function () {
      const amount = 100;
      const spender = accounts[2];
      const decreasedAmount = 50;

      test_log( "    approve  [1]->[2]: " + amount );
      await dponToken.approve(spender, amount, { from: accounts[1] });
      ASSERT_EQ("allowance[1]->[2]", await dponToken.allowance(accounts[1], spender), amount );

      test_log( "    decrease allowance [1]->[2]: " + decreasedAmount );
      await dponToken.decreaseAllowance(spender, decreasedAmount, { from: accounts[1] });
      ASSERT_EQ("allowance[1]->[2]", await dponToken.allowance(accounts[1], spender), decreasedAmount );
    });

    it('change owner and add super admin', async function () {
      test_log( "    transfer ownership [1]->[2]" );
      await dponToken.transferOwnership(accounts[2]);
      ASSERT_EQ( "token owner ", await dponToken.owner(), accounts[2] );
      ASSERT_EQ( "superadmin[0]", await dponToken.superAdmins(accounts[0]), false );
      // due to accounts[1] is the initial superadmin.
      ASSERT_EQ( "superadmin[1]", await dponToken.superAdmins(accounts[1]), true );
      // the owner is not a superadmin.
      ASSERT_EQ( "superadmin[2]", await dponToken.superAdmins(accounts[2]), false );
      ASSERT_EQ( "superadmin[3]", await dponToken.superAdmins(accounts[3]), false );

      test_log( "    add super admin [3] by [2]" );
      await dponToken.addSuperAdmin(accounts[3], { from: accounts[2] });
      ASSERT_EQ( "superadmin[0]", await dponToken.superAdmins(accounts[0]), false );
      ASSERT_EQ( "superadmin[1]", await dponToken.superAdmins(accounts[1]), true );
      ASSERT_EQ( "superadmin[2]", await dponToken.superAdmins(accounts[2]), false );
      ASSERT_EQ( "superadmin[3]", await dponToken.superAdmins(accounts[3]), true );

      test_log( "    remove super admin [3] by [2]" );
      await dponToken.removeSuperAdmin(accounts[3], { from: accounts[2] });
      ASSERT_EQ( "superadmin[3]", await dponToken.superAdmins(accounts[3]), false );

      test_log( "    add super admin [3] by [5]" );
      await EXPECT_EXCEPT("revert", dponToken.addSuperAdmin(accounts[3], { from: accounts[5] }));
     ASSERT_EQ( "superadmin[3]", await dponToken.superAdmins(accounts[3]), false );

      test_log( "    remove super admin [1] by [5]" );
      await EXPECT_EXCEPT("revert", dponToken.removeSuperAdmin(accounts[1], { from: accounts[5] }));
      ASSERT_EQ( "superadmin[1]", await dponToken.superAdmins(accounts[1]), true );
    });

   it('try to drain contract from admin address', async function () {
        await EXPECT_EXCEPT("revert", dponToken.emergencyERC20Drain(dponToken.address, new BigNumber(1), {from:accounts[0]}));
    });
  });

  describe('burnable', () => {
    it('self burn', async function () {
      ASSERT_EQ( "balances[1] ", await dponToken.balanceOf(accounts[1]), INITIAL_SUPPLY );
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 0 );

      test_log( "    transfer [1]->[2]: 5000" );
      await EXPECT_NOEXCEPT(dponToken.transfer(accounts[2], 5000, {from: accounts[1]}));
      ASSERT_EQ( "balances[1] ", await dponToken.balanceOf(accounts[1]), INITIAL_SUPPLY-5000 );
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 5000 );

      test_log( "    burn [1]: 1000" );
      await dponToken.burn( 1000, {from: accounts[1]} );

      test_log( "    burn [2]: 1000" );
      await dponToken.burn( 1000, {from: accounts[2]} );
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 4000 );
      ASSERT_EQ( "balances[1] ", await dponToken.balanceOf(accounts[1]), INITIAL_SUPPLY-6000 );

      test_log( "    burn [1]: " + INITIAL_SUPPLY-6000 );
      await dponToken.burn( INITIAL_SUPPLY-6000, {from: accounts[1]} );
      ASSERT_EQ( "balances[1] ", await dponToken.balanceOf(accounts[1]), 0 );

      test_log( "    burn [2]: 4000" );
      await dponToken.burn( 4000, {from: accounts[2]} );
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 0 );

      test_log( "    burn [1]: 1000" );
      await EXPECT_EXCEPT("revert", dponToken.burn( 1000, {from: accounts[1]} ));

      test_log( "    burn [2]: 1000" );
      await EXPECT_EXCEPT("revert", dponToken.burn( 1000, {from: accounts[2]} ));

      ASSERT_EQ( "balances[1] ", await dponToken.balanceOf(accounts[1]), 0 );
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 0 );
    });

    it('delegated burn', async function () {
      ASSERT_EQ( "balances[1] ", await dponToken.balanceOf(accounts[1]), INITIAL_SUPPLY );
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 0 );

      const spender = accounts[2];
      test_log( "    approve  [1]->[2]: 1000" );
      await EXPECT_NOEXCEPT(dponToken.approve(spender, 1000, { from: accounts[1] }));
      ASSERT_EQ( "allowance[1]->[2]", await dponToken.allowance(accounts[1], spender), 1000 );

      test_log( "    burn [1] by [2]: 1000" );
      await dponToken.burnFrom( accounts[1], 1000, {from: accounts[2]} );
      ASSERT_EQ( "allowance[1]->[2]", await dponToken.allowance(accounts[1], spender), 0 );
      ASSERT_EQ( "balances[1] ", await dponToken.balanceOf(accounts[1]), INITIAL_SUPPLY-1000 );
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 0 );

      test_log( "    burn [1] by [2]: 1000" );
      await EXPECT_EXCEPT("revert", dponToken.burnFrom( accounts[1], 1000, {from: accounts[2]} ));
      ASSERT_EQ( "allowance[1]->[2]", await dponToken.allowance(accounts[1], spender), 0 );
      ASSERT_EQ( "balances[1] ", await dponToken.balanceOf(accounts[1]), INITIAL_SUPPLY-1000 );
      ASSERT_EQ( "balances[2] ", await dponToken.balanceOf(accounts[2]), 0 );
    });
  });
});
