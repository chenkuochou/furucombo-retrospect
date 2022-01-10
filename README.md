# Furucombo retrospect

This repo studies the Furucombo approval hack event and retrospects two victims within block number 11940499.

## Attack 

### Method

Since the AaveV2 proxy had been whitelisted in Furucombo’s logic, the attacker can now use the double-delegation chain to call into their attacker contract under the Furucombo contract’s context. 

The attacker took advantage of combining a whitelisted AaveV2 proxy and non-initialized Furucombo contract storage with the following function calls. 

- `batchEcex`
- `_execs`
- `_exec`
Through `_exec` once a contract is valid, it will then be executed (potentially a delegatecall). The vulnerability is that the AaveV2 proxy was registered valid.

Therefore, the attacker can spoof AaveV2 Proxy by setting up `initialize(this, "")` to set the implementation to the attacker Furucombo. 

A double-delegation chain was then employed to the attacker address and transfer funds using `transferFrom()` from victims that approved the Furucombo contract beforehand.

From a list of victims, the hacker had targeted victims and performed attacks in descending order by account values.

## Rebuild the attack

1. `npm i`
2. `npx hardhat test`

## Audits

This attack would not have happened if the following measurements are considered.
- Set up `implementation` for the AaveV2 Proxy contract
- Only whitelist activated proxy contracts
- Add extra security layers before `_to` address forwards
- Regardless of initializer functions, `delegatecall` can be adjusted and relevant to the current context.

Whether the whitelisted contract had been audited is unknown, the vulnerabilities of a dynamic whitelist fall on the development team and internal auditors. 

## to-do

Wallets that have been interacted between block 11618386 and 11940503. It's non-trivial to investigate extra potential loss for the wallets tokens that have been approved before the attack. 

## reference
https://slowmist.medium.com/slowmist-analysis-of-the-furucombo-hack-28c9ae558db9  
https://github.com/MrToph/replaying-ethereum-hacks  
https://github.com/yunfangjuan/furucombo_feb_27_2021  
https://twitter.com/furucombo/status/1365743633605959681
