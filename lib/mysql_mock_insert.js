const $ = require('meeko')

function fillTable (db, tableName) {
  let insertObj = {}

  let tableObj = db[tableName]

  tableObj.field.forEach((x, idx) => {
    if (x !== 'id') {
      ;/([a-zA-Z_0=9]+)\({0,1}([0-9,]*)\){0,1}/g.test(tableObj.type[idx])
      let colTyep = RegExp.$1
      let colExt = RegExp.$2

      // console.log(x,colTyep,colExt)
      switch (colTyep) {
        case 'varchar':
          insertObj[x] = $.fake.randStr(+colExt)
          break
        case 'datetime':
          insertObj[x] = $.fake.randTime(0, $.now())
          break
        case 'tinyint':
          insertObj[x] = $.tools.rnd(0, 127)
          break
        case 'int':
          insertObj[x] = $.tools.rnd(0, 2147483647)
          break
        case 'bigint':
          insertObj[x] = $.tools.rnd(0, 2147483647)
          break
        case 'decimal':
          let a = colExt.split(',')
          let diff = (a[0] || 0) - (a[1] || 0) - 1
          insertObj[x] = +(
            +$.fake.randData('0123456789', diff) +
            '.' +
            $.fake.randData('0123456789', a[1] || 0)
          )
          break
        default:
          console.log('暂无对应类型mock方式', tableObj.type[idx])
      }
      //
    }
  })
  let r = db[tableName].C(insertObj).get()
  return r
}
async function multiFillTable (db, tableName, n = 10000) {
  let tableObj = db[tableName]
  if (!tableObj) {
    $.log(`表 ${tableName} 不存在`)
    return { errCode: 400, msg: `表 ${tableName} 不存在` }
  }
  let packetLen = await db.cmd('show variables like "max_allowed_packet"').run()
  let packetTimes =
    ((+packetLen[0].Value / fillTable(db, tableName).length) * 0.9) | 0

  let times = (n / packetTimes) | 0
  let mod = n % packetTimes
  // console.log(times,mod,packetTimes)
  let a = ''

  await tableObj.cmd('set autocommit = off;').run()
  for (let m = 0; m < times; m++) {
    for (let i = 0; i < packetTimes; i++) {
      a += fillTable(db, tableName)
    }
    await tableObj.cmd(a).run()
    a = ''
  }
  if (mod > 0) {
    for (let i = 0; i < mod; i++) {
      a += fillTable(db, tableName)
    }
    await tableObj.cmd(a).run()
  }
  await tableObj.cmd('set autocommit = on;').run()

  return 0
}

module.exports = multiFillTable
