const $ = require('meeko')
const Mysql = require('promise-mysql')
const Redis = require('ioredis')
Redis.Promise = require('bluebird') // 使用蓝鸟
const DbOpt = require('./lib/index')
const pack = require('./package.json')

class SkyDB {
  constructor (option) {
    this.mysqlObj = this.createMysqlOpt(option.mysql)
    this.redisOptObj = this.createRedisOpt(option.redis)
  }

  get mysql () {
    return this.mysqlObj
  }

  get redis () {
    return this.redisOptObj
  }

  async createMysqlOpt (o) {
    if (!o || $.tools.ifObjEmpty(o)) {
      console.log($.c.dimy('？ Skip Mysql Init...'))
      return {}
    }
    const [t, db, dbName, exColumn] = [
      $.now(),
      {},
      o.database || 'test',
      o.exColumn
    ]
    try {
      const pool = await Mysql.createPool(o)
      const r = await pool.query(`use \`${dbName}\`;show tables;`)
      let n = 0
      const tableSize = r[1].length
      let unLoadTable = tableSize // 准备加载表计数
      if (tableSize === 0) {
        $.log($.c.r('✘'), `J2sql (${pack.version}) [${$.c.y(0)} tables]`)
        return { errCode: 400, msg: '数据库中没有数据表' }
      }
      for (let i = 0; i < r[1].length; i++) {
        const item = r[1][i]
        const _name = item['Tables_in_' + dbName]
        db[_name] = {}
        const tableFieldArr = []
        const tableTypeArr = []
        ;(await pool.query(`desc \`${_name}\`;`)).map(item => {
          tableFieldArr.push(item.Field.toLowerCase())
          tableTypeArr.push(item.Type.toLowerCase())
        })
        $.ext(db[_name], new DbOpt(db, _name, exColumn))
        db[_name].field = tableFieldArr
        db[_name].type = tableTypeArr
        unLoadTable--
        n++
        db._nowPercent = ~~(((tableSize - unLoadTable) / tableSize) * 100)

        // $.log('DB Obj loading =>', db._nowPercent, '%') // 打印加载进度
        if (unLoadTable <= 0) {
          // 这里这样处理因为之前是异步调用完成所有表加载
          const outStr = `skySql (${pack.version || 'Unknown'}) [${$.c.y(
            `${o.host} : ${o.port}`
          )}] [${$.c.y(n)}] Tables loadTime: ${$.c.y($.now() - t)} ms`
          console.log($.c.g('✔'), outStr)
          pool.on('connection', function () {
            console.log($.c.g('✔'), outStr)
          })
          pool.on('enqueue', function () {
            $.log('<-- J2sql pool enqueue!')
          })
          db.pool = pool
          db.mysql = Mysql
          db.cmd = new DbOpt(db, _name, exColumn).cmd

          db.run = async function (preSql, valArr = []) {
            return db.pool.query(preSql, valArr)
          }
        } else {
        }
      }
    } catch (e) {
      console.error($.c.r('✘'), `Mysql: ${e.message}`)
    }
    return db
  }
  async createRedisOpt (o) {
    if (!o || $.tools.ifObjEmpty(o)) {
      console.log($.c.dimy('？ Skip Redis Init...'))
      return {}
    }
    try {
      if (o.auth) o.password = o.auth
      o.family = o.family || 4
      o.showFriendlyErrorStack = true
      const redis = new Redis(o)

      // ioredis 自动重连出错时：
      redis.reconnectOnError = function (e) {
        redis.connStatus = { stat: 0 }
        console.error(
          $.c.r('✘'),
          `-x- Redis [${$.c.y(`${o.host} : ${o.port}`)}] disconnect...`
        )
        console.error('redis连接失败原因：', e.code, e.message)
        return 1 // 返回true或1才会重新启动
      }
      redis.on('connect', async function () {
        redis.connStatus = { stat: 1 }
        let r = await redis.dbsize()
        console.log(
          $.c.g('✔'),
          `Redis [${$.c.y(`${o.host} : ${o.port}`)}] db ${$.c.y(
            o.db + ''
          )} [${$.c.y(r + '')}] Objects`
        )
      })
      redis.on('error', function (e) {
        console.error(
          $.c.r('✘'),
          `-x- Redis [${$.c.y(`${o.host} : ${o.port}`)}] ${e.toString()}`
        )
      })

      await $.tools.waitNotEmpty(redis, 'connStatus')
      return redis
    } catch (e) {
      console.error($.c.r('✘'), `Redis: ${e.message}`)
    }
  }
}

module.exports = SkyDB
