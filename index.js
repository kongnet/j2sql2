const $ = require('meeko')
const Mysql = require('promise-mysql')
const Redis = require('ioredis')
Redis.Promise = require('bluebird') // 使用蓝鸟
const DbOpt = require('./lib/mysql_opt')
const extendDB = require('./lib/mysql_crud.js')
const insertData = require('./lib/mysql_mock_insert.js')
const KeysLimit = require('./lib/redis_keys_limit.js')

const pack = require('./package.json')
/*
400 sql前端解析错误
401
402 sql后端执行错误
*/
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
        $.log($.c.r('✘'), `J2sql2 (${pack.version}) [${$.c.y(0)} tables]`)
        return { errCode: 402, msg: '数据库中没有数据表' }
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
        if (o.crudExtend) {
          // 如果有此属性，扩展ex属性
          db[_name].ex = {}
          const crudExtend = o.crudExtend || {}
          extendDB(db[_name].ex, db, _name, crudExtend)
        }
        // $.log('DB Obj loading =>', db._nowPercent, '%') // 打印加载进度
        if (unLoadTable <= 0) {
          // 这里这样处理因为之前是异步调用完成所有表加载
          const outStr = `j2sql2 (${pack.version || 'Unknown'}) [${$.c.y(
            `${o.host} : ${o.port}`
          )}] [${$.c.y(n)}] Tables, loadTime: ${$.c.y($.now() - t)} ms`
          console.log($.c.g('✔'), outStr)
          pool.on('connection', function () {
            console.log($.c.g('✔'), outStr)
          })
          pool.on('enqueue', function () {
            $.log('<-- J2sql2 pool enqueue!')
          })
          db.pool = pool
          db._mysql = pool
          db.cmd = new DbOpt(db, _name, exColumn).cmd

          db.run = async function (preSql, valArr = []) {
            return db.pool.query(preSql, valArr)
          }

          db.genData = async function (tableName, n = 10000) {
            return insertData(db, tableName, n)
          }
        } else {
        }
      }
    } catch (e) {
      console.error(
        $.c.r('✘'),
        `Mysql: [${$.c.y(`${o.host} : ${o.port}`)}] ${e.message}`
      )
    }
    return db
  }

  async createRedisOpt (o) {
    if (!o || $.tools.ifObjEmpty(o)) {
      console.log($.c.dimy('？ Skip Redis Init...'))
      return {}
    }
    try {
      const t = $.now()
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
        const r = await redis.dbsize()
        console.log(
          $.c.g('✔'),
          `Redis [${$.c.y(`${o.host} : ${o.port}`)}] db ${$.c.y(
            o.db + ''
          )} [${$.c.y(r + '')}] Objects, loadTime: ${$.c.y($.now() - t)} ms`
        )
      })
      redis.on('error', function (e) {
        console.error(
          $.c.r('✘'),
          `-x- Redis [${$.c.y(`${o.host} : ${o.port}`)}] ${e.toString()}`
        )
      })

      await $.tools.waitNotEmpty(redis, 'connStatus')
      redis.keysLimit = new KeysLimit(redis, o)
      return redis // 增加key过滤
    } catch (e) {
      console.error($.c.r('✘'), `Redis: ${e.message}`)
    }
  }
}

module.exports = SkyDB
