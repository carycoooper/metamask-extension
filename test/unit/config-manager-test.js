var assert = require('assert')
var ConfigManager = require('../../app/scripts/lib/config-manager')
var configManager

describe('config-manager', function() {

  before(function() {
    window.localStorage = {} // Hacking localStorage support into JSDom
    configManager = new ConfigManager()
  })

  describe('#setConfig', function() {
    window.localStorage = {} // Hacking localStorage support into JSDom

    it('should set the config key', function () {
      var testConfig = {
        provider: {
          type: 'rpc',
          rpcTarget: 'foobar'
        }
      }
      configManager.setConfig(testConfig)
      var result = configManager.getData()

      assert.equal(result.config.provider.type, testConfig.provider.type)
      assert.equal(result.config.provider.rpcTarget, testConfig.provider.rpcTarget)
    })

    it('setting wallet should not overwrite config', function() {
      var testConfig = {
        provider: {
          type: 'rpc',
          rpcTarget: 'foobar'
        }
      }
      configManager.setConfig(testConfig)

      var testWallet = {
        name: 'this is my fake wallet'
      }
      configManager.setWallet(testWallet)

      var result = configManager.getData()
      assert.equal(result.wallet.name, testWallet.name, 'wallet name is set')
      assert.equal(result.config.provider.rpcTarget, testConfig.provider.rpcTarget)

      testConfig.provider.type = 'something else!'
      configManager.setConfig(testConfig)

      result = configManager.getData()
      assert.equal(result.wallet.name, testWallet.name, 'wallet name is set')
      assert.equal(result.config.provider.rpcTarget, testConfig.provider.rpcTarget)
      assert.equal(result.config.provider.type, testConfig.provider.type)
    })
  })

  describe('rpc manipulations', function() {
    it('changing rpc should return a different rpc', function() {
      var firstRpc = 'first'
      var secondRpc = 'second'

      configManager.setRpcTarget(firstRpc)
      var firstResult = configManager.getCurrentRpcAddress()
      assert.equal(firstResult, firstRpc)

      configManager.setRpcTarget(secondRpc)
      var secondResult = configManager.getCurrentRpcAddress()
      assert.equal(secondResult, secondRpc)
    })
  })

  describe('transactions', function() {
    beforeEach(function() {
      configManager._saveTxList([])
    })

    describe('#getTxList', function() {
      it('when new should return empty array', function() {
        var result = configManager.getTxList()
        assert.ok(Array.isArray(result))
        assert.equal(result.length, 0)
      })
    })

    describe('#_saveTxList', function() {
      it('saves the submitted data to the tx list', function() {
        var target = [{ foo: 'bar' }]
        configManager._saveTxList(target)
        var result = configManager.getTxList()
        assert.equal(result[0].foo, 'bar')
      })
    })

    describe('#addTx', function() {
      it('adds a tx returned in getTxList', function() {
        var tx = { id: 1 }
        configManager.addTx(tx)
        var result = configManager.getTxList()
        assert.ok(Array.isArray(result))
        assert.equal(result.length, 1)
        assert.equal(result[0].id, 1)
      })
    })

    describe('#confirmTx', function() {
      it('sets the tx status to confirmed', function() {
        var tx = { id: 1, status: 'unconfirmed' }
        configManager.addTx(tx)
        configManager.confirmTx(1)
        var result = configManager.getTxList()
        assert.ok(Array.isArray(result))
        assert.equal(result.length, 1)
        assert.equal(result[0].status, 'confirmed')
      })
    })

    describe('#rejectTx', function() {
      it('sets the tx status to rejected', function() {
        var tx = { id: 1, status: 'unconfirmed' }
        configManager.addTx(tx)
        configManager.rejectTx(1)
        var result = configManager.getTxList()
        assert.ok(Array.isArray(result))
        assert.equal(result.length, 1)
        assert.equal(result[0].status, 'rejected')
      })
    })

    describe('#unconfirmedTxs', function() {
      it('returns unconfirmed txs in a hash', function() {
        configManager.addTx({ id: '1', status: 'unconfirmed' })
        configManager.addTx({ id: '2', status: 'confirmed' })
        let result = configManager.unconfirmedTxs()
        assert.equal(typeof result, 'object')
        assert.equal(result['1'].status, 'unconfirmed')
        assert.equal(result['0'], undefined)
        assert.equal(result['2'], undefined)
      })
    })

    describe('#getTx', function() {
      it('returns a tx with the requested id', function() {
        configManager.addTx({ id: '1', status: 'unconfirmed' })
        configManager.addTx({ id: '2', status: 'confirmed' })
        assert.equal(configManager.getTx('1').status, 'unconfirmed')
        assert.equal(configManager.getTx('2').status, 'confirmed')
      })
    })
  })
})