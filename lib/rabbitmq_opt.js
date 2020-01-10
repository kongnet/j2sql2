/* global isDevMode */
'use strict'
const $ = require('meeko')
const amqp = require('amqplib')

class RabbitMQ {
  constructor (option) {
    // 默认的配置
    const defObj = {
      protocol: 'amqp',
      hostname: 'localhost',
      port: 5672,
      username: 'guest',
      password: 'guest',
      vhost: '/'
    }
    this.opt = Object.assign(defObj, option)
    return this
  }
  async open (opt = {}) {
    const o = this.opt
    let protocolStr = `${o.protocol}://${o.username}:${o.password}@${o.hostname}:${o.port}${o.vhost}`
    try {
      let queueName = opt.queueName || 'testQueue'
      let open = await amqp.connect(protocolStr)
      let ch = await open.createChannel()
      ch.queueName = queueName
      console.log(
        $.c.g('✔'),
        'RabbitMQ',
        $.c.y(protocolStr),
        await ch.assertQueue(queueName)
      )
      this.ch = ch
      return ch
    } catch (e) {
      console.error(
        $.c.r('✘'),
        `-x- RabbitMQ [${$.c.y(
          `${o.protocol}://${o.username}:${o.password}@${o.hostname}:${o.port}${o.vhost}`
        )}] ${e.toString()}`
      )
      return -1
    }
  }
  async get (opt = {}) {
    //每次取1个
    const ch = this.ch
    const noAck = opt.noAck || true
    ch.assertQueue(ch.queueName)
    try {
      let r = await ch.get(ch.queueName, { noAck: noAck })
      return r
    } catch (e) {
      console.log('mqGet:', e)
      return -1
    }
  }
  async rev (opt = {}) {
    //同步方式，一直获取
    const ch = this.ch
    const noAck = opt.noAck || true
    const cbFunc = opt.cbFunc || async function () {}
    try {
      ch.prefetch(opt.prefetch || 1)
      ch.assertQueue(ch.queueName)
      let r = await ch.consume(ch.queueName, cbFunc, { noAck: noAck })
      return r
    } catch (e) {
      console.log('mqRev:', e)
      return -1
    }
  }
  async send (opt = {}) {
    const ch = this.ch
    const txt = opt.text || 'skyRabbitMQ'
    try {
      let r = await ch.sendToQueue(
        opt.queueName || ch.queueName, //ch默认channel
        Buffer.from(txt),
        {
          persistent: true //会断点续传之前未send完成的数据消息。（但此功能并不可靠，因为不会为所有消息执行同步IO，会缓存在cache并在某个恰当时机write到disk）
        }
      )
      return r
    } catch (e) {
      console.log('mqSend', e)
      return -1
    }
  }
}

module.exports = RabbitMQ
