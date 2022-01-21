/* global isDevMode */
'use strict'
const $ = require('meeko')
// 需要过滤的命令 按照redis5.0来
const comArr = [
  'append',
  'bitcount',
  'bitfield',
  'bitpos',
  'blpop',
  'brpop',
  'brpoplpush',
  'bzpopmax',
  'bzpopmin',
  'decr',
  'decrby',
  'del',
  'dump',
  'exists',
  'expire',
  'expireat',
  'geoadd',
  'geodist',
  'geohash',
  'geopos',
  'georadius',
  'georadiusbymember',
  'get',
  'getbit',
  'getrange',
  'getset',
  'hdel',
  'hexists',
  'hget',
  'hgetall',
  'hincrby',
  'hincrbyfloat',
  'hkeys',
  'hlen',
  'hmget',
  'hmset',
  'hscan',
  'hset',
  'hsetnx',
  'hstrlen',
  'hvals',
  'incr',
  'incrby',
  'incrbyfloat',
  'lindex',
  'linsert',
  'llen',
  'lpop',
  'lpush',
  'lpushx',
  'lrange',
  'lrem',
  'lset',
  'ltrim',
  'mget',
  'move',
  'mset',
  'msetnx',
  'persist',
  'pexpire',
  'pexpireat',
  'pfadd',
  'pfcount',
  'pfmerge',
  'pfselftest',
  'psetex',
  'pttl',
  'rename',
  'renamenx',
  'restore',
  'rpop',
  'rpush',
  'rpushx',
  'sadd',
  'scard',
  'sdiff',
  'sdiffstore',
  'select',
  'set',
  'setbit',
  'setex',
  'setnx',
  'setrange',
  'sinter',
  'sinterstore',
  'sismember',
  'smembers',
  'sort',
  'spop',
  'srandmember',
  'srem',
  'sscan',
  'strlen',
  'substr',
  'sunion',
  'sunionstore',
  'touch',
  'ttl',
  'type',
  'unlink',
  'watch',
  'xack',
  'xadd',
  'xclaim',
  'xdel',
  'xinfo',
  'xlen',
  'xpending',
  'xrange',
  'xread',
  'xreadgroup',
  'xgroup',
  'xrevrange',
  'xtrim',
  'zcard',
  'zcount',
  'zincrby',
  'zinterstore',
  'zlexcount',
  'zpopmax',
  'zpopmin',
  'zrange',
  'zrangebylex',
  'zrangebyscore',
  'zrank',
  'zrem',
  'zremrangebylex',
  'zremrangebyrank',
  'zremrangebyscore',
  'zrevrange',
  'zrevrangebylex',
  'zrevrangebyscore',
  'zrevrank',
  'zscan',
  'zscore',
  'zunionstore',
  'jdel',
  'jget',
  'jmget',
  'jset',
  'jtype',
  'jclear',
  'jtoggle',
  'jnumincrby',
  'jnummultby',
  'jstrappend',
  'jstrlen',
  'jarrappend',
  'jarrindex',
  'jarrinsert',
  'jarrlen',
  'jarrpop',
  'jarrtrim',
  'jobjkeys',
  'jobjlen',
  'jdebug',
  'jforget',
  'jresp'
]
class KeysLimit {
  constructor(redis = {}, option) {
    this.keyAllow = {} // 普通key值 ，模式key值 都化简为后面带 *号
    if (Array.isArray(option.keyLimit)) {
      this.limitStatus = 1
      for (let i = 0; i < option.keyLimit.length; i++) {
        if (option.keyLimit[i] === '*') {
          this.limitStatus = 0
        } else {
          this.add(option.keyLimit[i])
        }
      }
    } else {
      this.limitStatus = 0
    }

    for (const i in redis) {
      if (typeof redis[i] === 'function') {
        if (comArr.includes(i)) {
          const oriFunc = redis[i]
          const stat = () => this.limitStatus
          const checkKey = key => this.checkLimit(key)
          redis[i] = async function (...arg) {
            const a0 = arg[0]
            if (stat() && !checkKey(a0)) {
              const errStr = `redis.${i}: key [${a0}] is not Registered`
              throw new Error(errStr)
            }
            return oriFunc.apply(this, arg)
          }
        }
      }
    }
    return this
  }

  add(key) {
    let k = key.trim()
    if (k === '*') {
      this.limitStatus = 0 // 关闭限制
      return 1
    }
    if (k.indexOf('*') > 0) {
      k = k.replace(/\*/g, '')
      this.keyAllow[k] = 2 // 模式的
      return 1
    }
    this.keyAllow[key] = 1 // 非模式
    return 1
  }

  del(key) {
    let k = key.trim()
    if (k === '*') {
      this.limitStatus = 1
    } else {
      k = k.replace(/\*/g, '')
      delete this.keyAllow[k] // 删除 1 和 2
    }
  }

  list() {
    return this.keyAllow
  }

  checkLimit(keyName = '') {
    if (!this.limitStatus) return true
    const keyAllow = this.keyAllow
    for (const i in keyAllow) {
      if (keyAllow[i] === 1) {
        if (keyName === i) return true
      }
      if (keyAllow[i] === 2) {
        if (keyName.indexOf(i) >= 0) return true
      }
    }
    return false
  }

  get status() {
    // 0 关闭 1 开启
    return this.limitStatus
  }

  set status(b) {
    this.limitStatus = !!b
  }
}

module.exports = KeysLimit
