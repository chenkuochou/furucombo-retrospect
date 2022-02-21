# Furucombo retrospect

This repo studies the Furucombo approval hack and rebuilds two victims within block number 11940499.

<br>

## Attack

Since the AaveV2 proxy had been whitelisted in Furucombo’s logic, the attacker can use a double-delegation chain to call into their attacker contract under the Furucombo contract’s context.

The attacker took the advantage of combining a state of whitelisted AaveV2 proxy and non-initialized Furucombo contract storage to draw victim accounts with the following function calls.

- `batchExec`
- `_execs`
- `_exec`

Once a contract was valid at `_exec`, a delegate call will then be executed. That made the furucombo proxy vulnerabe since the AaveV2 proxy was registered valid.

The attacker spoofed AaveV2 proxy by setting up `initialize(this, "")` to set the implementation to the attacker storage.

A double-delegation chain was then employed to the attacker address and transfer funds using `transferFrom()` from victims that approved the Furucombo contract beforehand.

From a list of victims, the hacker had targeted victims and performed attacks in descending order by account amounts.

<br>

## Rebuild attacks

1. `npm i`
2. `npx hardhat test`

Two ERC20 tokens USDC and LINK are tested (hacked).

<br>

## Audits

This attack would not have happened if the following measurements are considered.

- Set up `implementation` for the AaveV2 proxy contract
- Only whitelist activated proxy contracts
- Add extra security layers before `_to` address forwards
- Regardless of initializer functions, `delegatecall` can be adjusted and relevant to the current context.

Whether the whitelisted contract had been audited is unknown, the vulnerabilities of a dynamic whitelist fall on the development team and internal auditors.

<br/>

## To-do

Wallets that have been interacted between block 11618386 and 11940503 might require further investigation. It's non-trivial to check potential loss for the wallets addresses that have been approved before the attack.

<br/>

## Reference

https://slowmist.medium.com/slowmist-analysis-of-the-furucombo-hack-28c9ae558db9  
https://github.com/MrToph/replaying-ethereum-hacks  
https://github.com/yunfangjuan/furucombo_feb_27_2021  
https://twitter.com/furucombo/status/1365743633605959681
