//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IRegistry {
    function infos(address) external view returns (bytes32);

    function isValid(address handler) external view returns (bool result);
}

interface IProxy {
    function batchExec(
        address[] memory tos,
        bytes32[] memory configs,
        bytes[] memory datas
    ) external;
}

// https://etherscan.io/address/0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9#code
interface IAaveV2Proxy {
    function initialize(address _logic, bytes memory _data) external payable;
}
