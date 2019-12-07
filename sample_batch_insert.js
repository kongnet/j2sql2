const SkyDB = require('./index.js')
const $ = require('meeko')
const Config = require('./sample_config') // redis mysql两组配置，以及mysql extend字段限制配置

async function init () {
  try {
    const skyDB = new SkyDB({ mysql: Config.mysql, redis: null })
    const db = await skyDB.mysql // 创建mysql实例
    /* 此为内置自动插入某表格n条例子
    console.time('10w')
    console.log(await db.genData('t3', 100000)) // 向admin_pay表 默认插入10w条模拟数据
    console.timeEnd('10w')
    */
    /* 此为事务模式+批量插入表格例子
    let conn = await db.pool.getConnection()
    await conn.beginTransaction()
    try {
      let c = 100000
      console.time('10w')
      while (c--) {
        await conn.query(
          `insert into t3 (pid,uid,amount,c_time) values (?,?,?,?)`,
          [2, 1, Math.floor(10000 * Math.random()), new Date()]
        )
      }
      await conn.commit()
      console.timeEnd('10w')
    } catch (e) {
      console.error(e)
      await conn.rollback()
    }
    await conn.release()
    */
  } catch (e) {
    console.log(e)
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
