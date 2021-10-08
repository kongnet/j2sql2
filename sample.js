const SkyDB = require('./index.js')
const Config = require('./sample_config') // redis mysql两组配置，以及mysql extend字段限制配置 注意配置

async function init () {
  try {
    const skyDB = new SkyDB({
      // mssql: Config.mssql,
      mysql: Config.mysql,
      redis: Config.redis,
      rabbitMQ: Config.rabbitMQ
    })

    const db = await skyDB.mysql // 创建mysql实例
    const rd = await skyDB.redis // 创建redis 实例
    const mq = await skyDB.rabbitMQ // 创建rabbitMq 实例
    // const mssql = await skyDB.mssql // 创建mssql 实例

    /*
    let result1 = await mssql.run(`select count(1) as '计数' from  dHistory`)
    console.dir(result1)
    */
    console.log('check key off', rd.keysLimit.add('*')) // 关闭redis检验,或者配置Config.redis
    console.log('设置j2sql2_test', await rd.set('j2sql2_test', '1'))
    console.log('获取j2sql2_test', await rd.get('j2sql2_test'))
    console.log('删除j2sql2_test', await rd.del('j2sql2_test'))
    console.log('获取j2sql2_test', await rd.get('j2sql2_test'))

    console.log('sql算式', await db.run('select ?+? as sum', [3, 2])) // 建议使用方式 db.run(preSQL模式)
    console.log('取一条d_flag=1的', await db.t1.R({}, {}, {}, 1).run()) // run最后 指定t1表模式
    console.log(await db.t2.ex) // crud.js扩展基本增删改查
    console.log(await db.t1.ex) // crud.js扩展基本增删改查
    console.log(await db.t1.ex.page(null, null, 3, 1, 'name', 1)) // 推荐分页方式 有2条d_flag数据被排除
    console.log(await db.t1.ex.list({ a: 1 })) // 无此字段，失败
    console.log((await db.t1.ex.list()).length)
    console.log(await db.t1.ex.getById(3))

    // console.log(await db.genData('t1')) 向t1表 默认插入1w条模拟数据
    rd.keysLimit.status = 1 // 重新打开redis key检验 或者 用rd.keysLimit.del('*')
    console.log(await rd.get('k1')) //
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
