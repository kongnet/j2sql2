const SkyDB = require('./index.js')
const Config = require('./sample_config.js')
async function init () {
  try {
    // 创建SkyDB实例
    const skyDB = new SkyDB({
      dmdb: Config.dmdb
    })
    // 创建dmdb实例
    const dm = await skyDB.dmdb

    // 测试增删改查
    let r = await dm.run('select * from test_user where username = ?;', [
      'test5'
    ])
    console.log('Select: ', r, r.length)
    await dm.run(
      'insert into test_user (username,password,email) values (?,?,?)',
      ['test5', 'pass5', 'test5@a.com']
    )
    r = await dm.run('select * from test_user where username = ?;', ['test5'])
    console.log('After Insert: ', r, r.length)
    await dm.run('update test_user set email = ? where username = ?;', [
      'test555@a.com',
      'test5'
    ])
    r = await dm.run('select * from test_user where username = ?;', ['test5'])
    console.log('After Update: ', r, r.length)
    await dm.run('delete test_user where username = ?;', ['test5'])
    r = await dm.run('select * from test_user where username = ?;', ['test5'])
    console.log('After Delete', r, r.length)
    await dm.pool.close() //关闭pool ,不关闭程序不会退出 ,因为有连接池存在 反复使用dm.run即可
  } catch (e) {
    console.log(e)
  }
}
init()

const errStackFn = e => {
  console.error(e.stack)
}
process.on('uncaughtException', errStackFn)
process.on('unhandledRejection', errStackFn)
