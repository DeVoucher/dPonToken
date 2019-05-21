
pragma solidity ^0.5.2;


import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "./Freezable.sol";

contract DponToken is ERC20Burnable, ERC20Detailed, Freezable {
    constructor (
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply,
        address _registry
    ) ERC20Detailed(_name, _symbol, _decimals) public {
        _mint(_registry, _totalSupply);
        addSuperAdmin(_registry);
    }

    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens.
     * @param value The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    // we use owner instead of minter.
    function mint(address to, uint256 value) public onlyOwner returns (bool) {
        _mint(to, value);
        return true;
    }

    /**
    * @dev Transfer token for a specified address
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transfer(address _to, uint _value) public
        validateAddress(_to)
        isNotFrozen(_to)
        returns (bool) {
        return super.transfer(_to, _value);
    }

    /**
    * @dev Transfer tokens from one address to another
    * @param _from address The address which you want to send tokens from
    * @param _to address The address which you want to transfer to
    * @param _value uint256 the amount of tokens to be transferred
    */
    function transferFrom(address _from, address _to, uint _value) public
        validateAddress(_to)
        isNotFrozenFrom(_from, _to)
        returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value) public
        validateAddress(_spender)
        isNotFrozen(_spender)
        returns (bool) {
        return super.approve(_spender, _value);
    }

    function increaseAllowance( address _spender, uint256 _addedValue ) public
        validateAddress(_spender)
        isNotFrozen(_spender)
        returns (bool) {
        return super.increaseAllowance(_spender, _addedValue);
    }

    function decreaseAllowance(address _spender, uint256 _subtractedValue) public
        validateAddress(_spender)
        isNotFrozen(_spender)
        returns (bool) {
        return super.decreaseAllowance(_spender, _subtractedValue);
    }
}
