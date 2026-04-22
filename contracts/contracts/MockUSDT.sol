// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockUSDT
 * @notice Minimal 6-decimal ERC20 used for local protocol testing.
 */
contract MockUSDT {
    string public constant name = "Mock USDT";
    string public constant symbol = "mUSDT";
    uint8 public constant decimals = 6;
    uint256 public totalSupply;

    address public s_owner;

    mapping(address => uint256) private s_balances;
    mapping(address => mapping(address => uint256)) private s_allowances;

    error MockUSDT__OnlyOwner();
    error MockUSDT__InsufficientBalance();
    error MockUSDT__InsufficientAllowance();

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    constructor() {
        s_owner = msg.sender;
        _mint(msg.sender, 10_000_000 * 10 ** uint256(decimals));
    }

    function balanceOf(address account) external view returns (uint256) {
        return s_balances[account];
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return s_allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        s_allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = s_allowances[from][msg.sender];
        if (allowed < amount) revert MockUSDT__InsufficientAllowance();
        if (allowed != type(uint256).max) {
            s_allowances[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    function transferMockTokens(address to, uint256 amount) external {
        if (msg.sender != s_owner) revert MockUSDT__OnlyOwner();
        _transfer(s_owner, to, amount * 10 ** uint256(decimals));
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount * 10 ** uint256(decimals));
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        s_balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        if (s_balances[from] < amount) revert MockUSDT__InsufficientBalance();
        s_balances[from] -= amount;
        s_balances[to] += amount;
        emit Transfer(from, to, amount);
    }
}
