/* global describe */
/* global it */
/* global before */
'use strict'
const assert = require('assert')
const $ = require('meeko')
global.$ = $
let db = {}
const SkyDB = require('../index.js')
const Config = require('../test_sample_config')
const allColumn = '`id` as id,`pid` as pid,`name` as name,`son` as son,`c_time` as cTime,`m_time` as mTime,`d_flag` as dFlag,`cell` as cell,`time` as time,`a` as a,`b` as b'
describe('mongoDB转MySQL增删改查基础的单元测试', function () {
  before(async () => {
    const skyMysql = new SkyDB({
      mysql: Config.mysql
    })
    db = await skyMysql.mysql
    // await $.wait(1000)
  })
  it('1.find&findone测试', async () => {
    // console.log(db._mysql)
    assert.strictEqual(db.test.R({
      cell: true
    }).get(), `select ${allColumn} from \`test\` where \`cell\`=true;`)

    assert.strictEqual(db.test.find().get(), `select ${allColumn} from \`test\`;`)
    assert.strictEqual(db.test.R().get(), `select ${allColumn} from \`test\`;`)
    assert.strictEqual(db.test.select().get(), `select ${allColumn} from \`test\`;`)
    assert.strictEqual(db.test.find({
      time: {
        '>=': 123,
        '<': 1000
      }
    }).get(), `select ${allColumn} from \`test\` where \`time\`>=123 and \`time\`<1000;`)
    assert.strictEqual(db.test.find({
      time: {
        '>=': 'x123',
        '<': 'x1000'
      }
    }).get(), `select ${allColumn} from \`test\` where \`time\`>=\'x123\' and \`time\`<\'x1000\';`)
    assert.strictEqual(db.test.find({
      'min(a)+1': {
        '>=': 'x123',
        '<': 'x1000'
      }
    }).get(), `select ${allColumn} from \`test\` where min(a)+1>=\'x123\' and min(a)+1<\'x1000\';`)
    /* assert.strictEqual(db.test.find({}, {
      cell: 1,
      'min(id)': 1
    }).get(), 'select `cell` as cell,`min(id)` as min(id) from `test`;') */
    assert.strictEqual(db.test.find({}, {}, {
      a: 1,
      b: -1
    }).get(), `select ${allColumn} from \`test\` order by \`a\` asc, \`b\` desc;`)

    assert.strictEqual(db.test.find({}, {}, {}, 5).get(), `select ${allColumn} from \`test\` limit 5;`)
    assert.strictEqual(db.test.findOne().get(), `select ${allColumn} from \`test\` limit 1;`)
    assert.strictEqual(db.test.R({
      cell: '13052000000'
    }).get(), `select ${allColumn} from \`test\` where \`cell\`='13052000000';`, db.test.R({
      cell: '13052000000'
    }).get())
  })

  it('2.remove测试', async () => {
    assert.strictEqual(db.test.remove().get(), '[Empty!!]')
    assert.strictEqual(db.test.remove({}, 1).get(), 'delete from `test`;')
    assert.strictEqual(db.test.D({}, 1).get(), 'delete from `test`;')
    assert.strictEqual(db.test.delete({}, 1).get(), 'delete from `test`;')
    assert.strictEqual(db.test.remove({
      time: {
        '>=': 123,
        '<': 1000
      }
    }).get(), 'delete from `test` where `time`>=123 and `time`<1000;')
  })

  it('3.update测试', async () => {
    assert.strictEqual(db.test.U({
      id: 11
    }).get(), '[Empty!!]')
    assert.strictEqual(db.test.update().get(), '[Empty!!]')
    assert.strictEqual(db.test.update({}, {
      cell: '1',
      'min(id)': 1
    }).get(), '[Empty!!]')

    /* assert.strictEqual(db.test.update({}, {
      cell: 1,
      'min(id)': 1
    }, 1).get(), 'update `test` set `cell`=1,`min(id)`=1;')
    assert.strictEqual(db.test.U({}, {
      cell: 1,
      'min(id)': 1
    }, 1).get(), 'update `test` set `cell`=1,`min(id)`=1;')
    assert.strictEqual(db.test.update({
      'time': {
        '>=': 123,
        '<': 1000
      }
    }, {
      cell: 1,
      'min(id)': 1
    }).get(), 'update `test` set `cell`=1,`min(id)`=1 where `time`>=123 and `time`<1000;')
    */
  })

  /* it('4.insert测试', async () => {
    assert.strictEqual(db.test.insert().get(), '[Empty!!]')
    assert.strictEqual(db.test.insert({
      cell: 1,
      'min(id)': 1
    }).get(), 'insert into `test` (`cell`,`min(id)`) values (1,1);')
    assert.strictEqual(db.test.C({
      cell: 1,
      'min(id)': 1
    }).get(), 'insert into `test` (`cell`,`min(id)`) values (1,1);')
    assert.strictEqual(db.test.C({
      cell: 'x',
      'min(id)': 1
    }).get(), 'insert into `test` (`cell`,`min(id)`) values (\'x\',1);')
    assert.strictEqual(db.test.C({
      cell: 'md5(x)',
      'min(id)': 1
    }).get(), 'insert into `test` (`cell`,`min(id)`) values (md5(x),1);')
    assert.strictEqual(db.test.C({
      cell: '\'md5(x)\'',
      'min(id)': 1
    }).get(), 'insert into `test` (`cell`,`min(id)`) values (\'md5(x)\',1);')
    assert.strictEqual(db.test.C({
      cell: 'x=1',
      'min(id)': 1
    }).get(), 'insert into `test` (`cell`,`min(id)`) values (\'x=1\',1);')
    assert.strictEqual(db.test.insert({
      cell: '1',
      'd1': new Date('2017-01-18T12:20:57.240Z')
    }).get(), 'insert into `test` (`cell`,`d1`) values (\'1\', "2017-01-18T12:20:57.240Z");')
    assert.strictEqual(db.test.insert({
      cell: '1',
      'd1': null
    }).get(), 'insert into `test` (`cell`,`d1`) values (\'1\', NULL);')
    assert.strictEqual(db.test.insert({
      cell: '1',
      'd1': undefined
    }).get(), 'insert into `test` (`cell`,`d1`) values (\'1\', NULL);')
    assert.strictEqual(db.test.insert({
      cell: '1',
      'd1': [1, 4]
    }).get(), 'insert into `test` (`cell`,`d1`) values (\'1\', \'[1,4]\');')
    assert.strictEqual(db.test.insert({
      cell: '1',
      'd1': {
        a: 1,
        b: '2'
      }
    }).get(), 'insert into `test` (`cell`,`d1`) values (\'1\', \'{"a":1,"b":"2"}\');')
    assert.strictEqual(db.test.insert({
      cell: '1',
      'd1': /kong+/g
    }).get(), 'insert into `test` (`cell`,`d1`) values (\'1\', \'{}\');')
  })
  it('4-1.insert唯一插入测试', async () => {
    assert.strictEqual(db.test.insert({
      cell: '1',
      'phone': 1
    }, 'phone').get(), 'insert into `test` (`cell`,`phone`) select \'1\',1 from dual WHERE NOT EXISTS(SELECT `phone` FROM `test` WHERE `phone` = 1) limit 1;')
    assert.strictEqual(db.test.insert({
      cell: '1',
      'phone': 1
    }, 'cell').get(), 'insert into `test` (`cell`,`phone`) select \'1\',1 from dual WHERE NOT EXISTS(SELECT `cell` FROM `test` WHERE `cell` = \'1\') limit 1;')
  })
  it('5.cmd测试', async () => {
    assert.strictEqual(db.test.cmd('show databases;').get(), 'show databases;')
    assert.strictEqual(db.test.cmd('show databases').get(), 'show databases;')
    assert.strictEqual(db.cmd('show databases').get(), 'show databases;')
  })
  it('6.特殊类型函数条件测试', async () => {
    assert.strictEqual(db.test.R({
      'ax(id)': 1
    }).get(), 'select ${allColumn} from `test` where `ax(id)`=1;')
    assert.strictEqual(db.test.R({
      'md5': 'md5(id)+max(id)'
    }).get(), 'select ${allColumn} from `test` where `md5`=md5(id)+max(id);')
    assert.strictEqual(db.test.R({
      'md5': '\'md5(id)\''
    }).get(), 'select ${allColumn} from `test` where `md5`=\'md5(id)\';')
    assert.strictEqual(db.test.R({
      'md5': null
    }).get(), 'select ${allColumn} from `test` where `md5` is NULL;')
    assert.strictEqual(db.test.R({
      'time': new Date('2016-01-01 12:12:13')
    }).get(), "select ${allColumn} from `test` where `time`='2016-01-01 12:12:13';")
    assert.strictEqual(db.test.R({
      'name': /%kong/g
    }).get(), "select ${allColumn} from `test` where `name` like '%kong';")
    assert.strictEqual(db.test.R({
      'name': /kong%/g
    }).get(), "select ${allColumn} from `test` where `name` like 'kong%';")
    assert.strictEqual(db.test.R({
      'name': /%kong%/g
    }).get(), "select ${allColumn} from `test` where `name` like '%kong%';")
    assert.strictEqual(db.test.R({
      'name': [1, 'x', 3]
    }).get(), "select ${allColumn} from `test` where `name` in (1,'x',3);", db.test.R({
      'name': [1, 'x', 3]
    }).get())
  })
  it('7.run测试', async () => {
    let rs = await db.cmd('select `id` from `test` limit 1;').run()
    let obj = await db.test.R({
      id: rs[0].id
    }, {}, {}, 1).run()
    assert.strictEqual(obj[0].id, rs[0].id)
    obj = await db.test.R({
      id: rs[0].id
    }, {}, {}, 1).run(true, true)
    assert.strictEqual(obj[1][0].id, rs[0].id)
    obj = await db.test.R({
      idx: 1001
    }, {}, {}, 1).run()
    assert.strictEqual(obj, -1)
    obj = await db.test.R({
      id: rs[0].id
    }, {}, {}, 1).run(true)
    assert.strictEqual(obj[1][0].id, rs[0].id)
    obj = await db.test.R({
      idx: 1001
    }, {}, {}, 1).run(true, true)
    assert.strictEqual(obj, -1)
  })
  it('8.exec测试', function* () {
    let rs = yield db.cmd('select `id` from `test` limit 1;').exec()
    let obj = yield db.test.R({
      id: rs[0].id
    }, {}, {}, 1).exec()
    assert.strictEqual(obj[0].id, rs[0].id)
    obj = yield db.test.R({
      id: rs[0].id
    }, {}, {}, 1).exec(true, true)
    assert.strictEqual(obj[1][0].id, rs[0].id)
    obj = yield db.test.R({
      idx: 1001
    }, {}, {}, 1).exec()
    assert.strictEqual(obj, -1)
    obj = yield db.test.R({
      id: rs[0].id
    }, {}, {}, 1).exec(true)
    assert.strictEqual(obj[1][0].id, rs[0].id)
    obj = yield db.test.R({
      idx: 1001
    }, {}, {}, 1).exec(true, true)
    assert.strictEqual(obj, -1)
  })
  */
})
