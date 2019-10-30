const SkyDB = require('./index.js')

async function init () {
  const dbObj = {
    host: '127.0.0.1', // ip或者域名
    port: 3306,
    pool: 1000,
    timeout: 500000,
    user: 'root',
    password: '123456',
    database: 'test',
    multipleStatements: true // 允许运行多行SQL
  }
  const redisObj = {
    host: '127.0.0.1',
    port: 6379,
    auth: '',
    db: 0
  }
  try {
    const skyDB = new SkyDB({ mysql: dbObj, redis: redisObj })
    const db = await skyDB.mysql // 创建mysql实例
    const rd = await skyDB.redis // 创建redis 实例
    console.log('设置j2sql2_test', await rd.set('j2sql2_test', '1'))
    console.log('获取j2sql2_test', await rd.get('j2sql2_test'))
    console.log('删除j2sql2_test', await rd.del('j2sql2_test'))
    console.log('获取j2sql2_test', await rd.get('j2sql2_test'))

    console.log(await db.run('select ?+? as sum', [1, 2])) // 建议使用方式
    console.log(await db.t1.R({}, {}, {}, 1).run())
  } catch (e) {
    console.error(e)
  }
}
init()

// main()
/*
enum 枚举型 一共65535
set 集合型 1+2+4...+64
*/

const errStackFn = e => {
  console.error(e.stack)
}
process.on('uncaughtException', errStackFn)
process.on('unhandledRejection', errStackFn)
