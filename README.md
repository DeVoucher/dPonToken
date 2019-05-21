# dPon Token  - Non-fungible digital asset for the real economy

[![dPonToken](http://dpon.io/images/d-pon-logo.svg)](http://dpon.io/images/d-pon-logo.svg)

**dPon Token(DPN)** is a cryptocurrency on Ethereum. dPon Network is a blockchain platform specialized in gift coupon.


# Smart-contracts

dPonToken smart-contract contains:

  - The SafeMath library for protection against overflow during arithmetic operations.

  - Standard ERC20 functions and events.
    - `function balanceOf(address who) external view returns (uint256);`
    Returns the balance of the specified address.

    - `function transfer(address to, uint256 value) external returns (bool);`
    Transfer token to a specified address.

    - `function transferFrom(address from, address to, uint256 value) external returns (bool);`
    Transfer tokens from one address to another.

    - `function approve(address spender, uint256 value) external returns (bool);`
    Permits the deduction of a given quantity of tokens from a given address from the message sender’s account;

    - `function allowance(address owner, address spender) external view returns (uint256);`
    To check the amount of tokens that an owner allowed to a spender.

  - Public variables and constants:
    - `name` – token name;
    - `symbol` – token symbol;
    - `decimals` – number of digits the cryptocurrency has after the decimal point;
    - `totalSupply` – total supply of coins;


### Additional materials
For additional information on this project please follow the links to our official homepage:
* [http://dpon.io](http://dpon.io) - official homepage
