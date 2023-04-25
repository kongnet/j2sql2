/* global isDevMode */
'use strict'
const $ = require('meeko')
const amqp = require('amqp-connection-manager')

class RabbitMQ {
  constructor (opt) {
    const defObj = {
      protocol: 'amqp',
      hostname: 'localhost',
      port: 5672,
      username: 'guest',
      password: 'guest',
      vhost: '/',
      queueName: 'test'
    }
    this.opt = opt || defObj
    this.urls = this.opt.urls || []
    if (this.urls.length === 0) {
      const protocolStr = `${this.opt.protocol}://${this.opt.username}:${this.opt.password}@${this.opt.hostname}:${this.opt.port}${this.opt.vhost}`
      this.urls.push(protocolStr)
    }
  }

  async open () {
    const that = this
    if (this.urls.length === 0) {
      console.error($.c.r('✘'), '-x- RabbitMQ 配置不存在')
      return -1
    }
    this.conn = amqp.connect(this.urls, this.opt.connectOpt)
    this.conn.on('connect', function ({ url }) {
      console.log($.c.g('✔'), `RabbitMQ ${$.c.y(url)}`)
    })
    this.conn.on('disconnect', function ({ err }) {
      console.error(
        $.c.r('✘'),
        `-x- RabbitMQ disconnect ${err.toString()} queueLength=${
          that.ch && that.ch.queueLength()
        }`
      )
    })
    this.conn.on('connectFailed', function ({ err }) {
      console.error($.c.r('✘'), `-x- RabbitMQ connectFailed ${err.toString()}`)
    })
    this.ch = this.conn.createChannel({
      setup: async channel => {
        this.initMQ(this.opt)
        // TODO:fix  sky-api-register rtsMQ.ch.connection.expectSocketClose
        this.ch.connection = channel.connection
        this.ch.connStatus = true
      },
      confirm: false,
      ...this.opt.channelOpt
    })
    await $.tools.waitNotEmpty(this.ch, 'connStatus')

    return this.ch
  }

  async initMQ (opt) {
    try {
      const {
        exchangeType,
        queueName = this.ch.queueName,
        queueNames = [],
        routingKey = '',
        bindQueueArg,
        bindQueues
      } = opt
      let exchangeName = opt.exchangeName
      if (exchangeType) {
        exchangeName = exchangeName || `amq.${exchangeType}`
      }
      // init exchange
      if (exchangeName) {
        console.log(
          $.c.g('✔'),
          'RabbitMQ assertExchange',
          await this.ch.assertExchange(
            exchangeName,
            exchangeType,
            opt.exchangeOption
          )
        )
      }
      // init queue
      if (queueNames.length === 0) queueNames.push(queueName)
      for (const qName of queueNames) {
        console.log(
          $.c.g('✔'),
          'RabbitMQ assertQueue',
          await this.ch.assertQueue(qName)
        )
        if (!bindQueues && exchangeName) {
          // fanout -> bind queue
          await this.ch.bindQueue(qName, exchangeName, routingKey, bindQueueArg)
          console.log(
            $.c.g('✔'),
            'RabbitMQ bindQueue',
            JSON.stringify({
              queueName: qName,
              exchangeName,
              routingKey,
              bindQueueArg
            })
          )
        }
      }
      // topic -> bind queue
      if (bindQueues) {
        for (const obj of bindQueues) {
          await this.ch.bindQueue(
            obj.queueName,
            exchangeName,
            obj.routingKey,
            obj.bindQueueArg
          )
          console.log(
            $.c.g('✔'),
            'RabbitMQ bindQueue',
            JSON.stringify({
              queueName: obj.queueName,
              exchangeName,
              routingKey: obj.routingKey,
              bindQueueArg: obj.bindQueueArg
            })
          )
        }
      }
    } catch (e) {
      console.error($.c.r('✘'), `RabbitMQ initMQ ${e.toString()}`)
    }
  }

  async get (opt = {}) {
    // 每次取1个
    const ch = this.ch
    const noAck = opt.noAck || false
    try {
      await ch.assertQueue(opt.queueName || this.opt.queueName)
      const r = await ch.get(opt.queueName || this.opt.queueName, {
        noAck: noAck
      })
      return r
    } catch (e) {
      console.error('mqGet:', e.toString())
      return -1
    }
  }

  async rev (opt = {}) {
    // 同步方式，一直获取
    const ch = this.ch
    const noAck = opt.noAck || false // noAck 相当于 autoAck 不要搞混,默认不自动ack
    const cbFunc = opt.cbFunc || async function () {}
    const prefetch = opt.prefetch || 1
    try {
      await ch.assertQueue(opt.queueName || this.opt.queueName)
      await ch.consume(
        opt.queueName || this.opt.queueName,
        async function (data) {
          cbFunc(data, ch)
        },
        {
          noAck: noAck,
          prefetch: prefetch
        }
      )
      return ch
    } catch (e) {
      console.error('mqRev', e.toString())
      return -1
    }
  }

  async send (opt = {}) {
    const ch = this.ch
    const txt = opt.text || 'skyRabbitMQ'
    try {
      const r = await ch.sendToQueue(
        opt.queueName || this.opt.queueName,
        Buffer.from(txt),
        {
          persistent: true // 会断点续传之前未send完成的数据消息。（但此功能并不可靠，因为不会为所有消息执行同步IO，会缓存在cache并在某个恰当时机write到disk）
        }
      )
      return r
    } catch (e) {
      console.error('mqSend', e.toString())
      return -1
    }
  }
  async publish (opt = {}) {
    const ch = this.ch
    const txt = opt.text || 'skyRabbitMQ'
    try {
      const r = await ch.publish(
        opt.exchangeName ||
          this.opt.exchangeName ||
          `amq.${this.opt.exchangeType}`,
        opt.routingKey || this.opt.routingKey,
        Buffer.from(txt),
        {
          persistent: true
        }
      )
      return r
    } catch (e) {
      console.error('mqPublish', e.message)
      return -1
    }
  }
}

module.exports = RabbitMQ
