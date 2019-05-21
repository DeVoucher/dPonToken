
const { ASSERT_EQ, EXPECT_EXCEPT, EXPECT_NOEXCEPT } = require('./helpers/assertion');
const Freezable = artifacts.require('Freezable');


contract('TEST_Freezable', (accounts) => {
	beforeEach(async function () {
		this.freezable = await Freezable.new({from: accounts[0]});
	});

	describe('freezeAccount', () => {
		it('contract owner can freeze token', async function () {
			ASSERT_EQ( "is frozen token", await this.freezable.frozenToken(), false );

			await this.freezable.freezeToken(true, {from: accounts[0]});
			ASSERT_EQ( "is frozen token", await this.freezable.frozenToken(), true );

	      	await EXPECT_EXCEPT("revert",
				this.freezable.freezeToken(true, {from: accounts[0]})
			);
			ASSERT_EQ( "is frozen token", await this.freezable.frozenToken(), true );
		});

		it('non owner can not freeze token', async function () {
			ASSERT_EQ( "is frozen token", await this.freezable.frozenToken(), false );

	      	await EXPECT_EXCEPT("revert",
				this.freezable.freezeToken(true, {from: accounts[1]})
			);
			ASSERT_EQ( "is frozen token", await this.freezable.frozenToken(), false );
		});


		it('contract owner can add a frozen account', async function () {
			ASSERT_EQ( "is frozen[1]", await this.freezable.frozenAccounts(accounts[1]), false );

			await this.freezable.freezeAccount(accounts[1], true, {from: accounts[0]});
			ASSERT_EQ( "is frozen[1]", await this.freezable.frozenAccounts(accounts[1]), true );
		});

		it('non owner can not freeze another account', async function () {
			ASSERT_EQ( "is frozen[2]", await this.freezable.frozenAccounts(accounts[2]), false );

	      	await EXPECT_EXCEPT("revert",
				this.freezable.freezeAccount(accounts[2], true, {from: accounts[1]})
			);
			ASSERT_EQ( "is frozen[2]", await this.freezable.frozenAccounts(accounts[2]), false );
		});

		it('cannot add a frozen account that is already a frozen account', async function () {
			ASSERT_EQ( "is frozen[1]", await this.freezable.frozenAccounts(accounts[1]), false );

			await this.freezable.freezeAccount(accounts[1], true, {from: accounts[0]});
			ASSERT_EQ( "is frozen[1]", await this.freezable.frozenAccounts(accounts[1]), true );

		 	// second call fails
	      	await EXPECT_EXCEPT("revert",
				this.freezable.freezeAccount(accounts[1], true, {from: accounts[0]})
			);
			ASSERT_EQ( "is frozen[1]", await this.freezable.frozenAccounts(accounts[1]), true );
		});
	});
});

