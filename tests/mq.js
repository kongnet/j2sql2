'use strict'
const assert = require('assert')
const SkyDB = require('../index.js')
const $ = require('meeko')
const Config = require('../sample_config')
global.$ = $
let rabbitMQ
describe('mq', function () {

  before(async () => {
    const skyMysql = new SkyDB({
      rabbitMQ: {
        protocol: 'amqp',
        hostname: 'localhost',
        port: 5672, // 默认 5672
        username: 'guest', // guest
        password: 'guest', // guest
        vhost: '/',
        queueName: 'test'
      }
    })
    rabbitMQ = await skyMysql.rabbitMQ
    await $.wait(3000)
  })

  describe('test', function () {
    it.skip('connect', async () => {
      const skyMysql = new SkyDB({
        rabbitMQ: {
          protocol: 'amqp',
          hostname: 'localhost',
          port: 5672, // 默认 5672
          username: 'guest', // guest
          password: 'guest', // guest
          vhost: '/',
          queueName: 'test'
        }
      })
      const rabbitMQ = await skyMysql.rabbitMQ
      console.log(rabbitMQ)
      await $.wait(10000)
    })
    it('send', async () => {
      const r = await rabbitMQ.send({ text: '1' })
      assert.ok(r)
    })
    it.skip('rev', async () => {
      rabbitMQ.rev({
        noAck: false,
        // prefetch: 1,
        cbFunc: consumerFunc,
        // queueName: 'test'
      })
      function consumerFunc(data,ch){
        console.log(data.content.toString())
        ch.ack(data)
      }
      // assert(false)
    })
  })

})
