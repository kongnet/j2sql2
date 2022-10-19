const $ = require('meeko')
const Mysql = require('promise-mysql')
const isStringType = function (fieldType) {
  if (
    fieldType.indexOf('datetime') >= 0 ||
    fieldType.indexOf('bigint') >= 0 ||
    fieldType.indexOf('decimal') >= 0 ||
    fieldType.indexOf('enum') >= 0 ||
    fieldType.indexOf('char') >= 0 ||
    fieldType.indexOf('text') >= 0 ||
    fieldType.indexOf('blob') >= 0
  ) {
    return 1
  } else {
    return 0
  }
}
const isNumType = function (fieldType) {
  if (
    fieldType.indexOf('int') >= 0 ||
    fieldType.indexOf('decimal') >= 0 ||
    fieldType.indexOf('double') >= 0 ||
    fieldType.indexOf('float') >= 0 ||
    fieldType.indexOf('bit') >= 0
  ) {
    return 1
  } else {
    return 0
  }
}
function logSql (sql, ifShowSql) {
  if (ifShowSql) {
    $.option.logTime = false
    $.log(sql)
    $.option.logTime = true
  }
}
const DbOpt = function (db, tbName, option = {}) {
  let [me, sql, _name] = [this, '', tbName]
  me.db = db
  me.errObj = null
  me.get = function () {
    if (me.errObj) {
      sql = ''
      console.log($.c.r('✘'), me.errObj)
      return me.errObj
    }
    // 返回生成的sql
    const s = sql
    sql = ''
    return s
  }
  me.sql = me.get
  me.cmd = function (s, v = '') {
    const _tail = ~s.indexOf(';') ? '' : ';'
    sql += Mysql.format(s, v) + _tail // 建议使用 preSql防止注入
    return me
  }
  me.exec = async function (ifTrans, ifShowSql) {
    let sql = me.get()
    let r
    if (ifTrans) {
      try {
        sql = `begin;${sql}commit;`
        logSql(sql, ifShowSql)
        r = await me.db.pool.query(sql)
        return r
      } catch (e) {
        await me.db.pool.query('rollback;')
        const err = e.toString()
        new RegExp('(.+)', 'gm').test(err)
        const light = RegExp.$1
        // NOTICE:不要使用ctrl+alt+F 格式化代码
        $.err(
          sql.replace(light, `${$.c.r(light)}`),
          `\n${err.replace(/('.+')/gm, `${$.c.y(RegExp.$1)}`)}`
        )
        $.log(`${$.c.g('Rollback')}`)
        return { errCode: 402, msg: sql + ' 执行出错' }
      }
    } else {
      try {
        logSql(sql, ifShowSql)
        return await me.db.pool.query(sql)
      } catch (e) {
        const err = e.toString()
        new RegExp("'([^']+)'", 'gm').test(err)
        const light = RegExp.$1
        // NOTICE:不要使用ctrl+alt+F 格式化代码
        $.err(
          sql.replace(light, `${$.c.r(light)}`),
          `\n${err.replace(/('[^']+')/gm, `${$.c.y(RegExp.$1)}`)}`
        )
        return { errCode: 402, msg: sql + ' 执行出错' }
      }
    }
  }
  me.run = async function (ifTrans, ifShowSql) {
    if (me.errObj) {
      sql = ''
      return me.errObj
    }
    return me.exec(ifTrans, ifShowSql)
  }
  me.where = function (o, type) {
    me.errObj = null // 清空错误
    let _item
    const a = []
    const field = me.db[_name].field
    if (option.columnCamelize) {
      let a1 = {}
      for (let i in o) {
        a1[i.deCamelize('_')] = o[i]
      }
      o = a1
    }
    for (const i in o) {
      if (!field.includes(i.toLowerCase())) {
        me.errObj = { errCode: 400, msg: `WHERE错误，表 ${_name} 没有 ${i} 列` }
        return a
      }
      const fieldType =
        me.db[_name].type[field.findIndex(x => x === i.toLowerCase())]
      //console.log(fieldType, typeof o[i])
      switch (typeof o[i]) {
        case 'string': {
          if (!isStringType(fieldType)) {
            me.errObj = {
              errCode: 400,
              msg: `列类型错误，表 ${_name} 列 ${i} 为 ${fieldType}`
            }
            return a
          }
          let _pre = "'"
          ;/[0-9a-zA-z_]+\(.+\)/g.test(o[i]) && (_pre = '') // NOTICE: 注意前面的分号
          _item = `\`${i}\`=${_pre}${o[i]}${_pre}`
          break
        }
        case 'number':
          if (!isNumType(fieldType)) {
            me.errObj = {
              errCode: 400,
              msg: `列类型错误，表 ${_name} 列 ${i} 为 ${fieldType}`
            }
            return a
          }
          _item = `\`${i}\`=${o[i]}`
          break
        case 'boolean':
          _item = `\`${i}\`=${o[i]}`
          break
        case 'object': {
          if (type === 'update') {
            const _preStr = o[i] instanceof Date ? '' : "'"
            _item = `\`${i}\` = ${
              o[i] ? _preStr + (JSON.stringify(o[i]) + _preStr) : 'NULL'
            }`
            break
          }
          if (!o[i]) {
            // NOTICE: 不能严格等于
            _item = `\`${i}\` is NULL`
            break
          }
          if (o[i] instanceof Date) {
            _item = `\`${i}\`='${o[i].date2Str()}'`
            break
          }
          if (o[i] instanceof Array) {
            _item = `\`${i}\` in ${JSON.stringify(o[i])
              .replaceAll('[', '(')
              .replaceAll(']', ')')
              .replaceAll('"', "'")}`
            break
          }
          if (o[i] instanceof RegExp) {
            _item = `\`${i}\` like '${o[i]
              .toString()
              .replaceAll('/g', '')
              .replaceAll('/', '')}'`
            break
          }
          const _objAry = []
          for (const i2 in o[i]) {
            const _pre1 = typeof o[i][i2] === 'string' ? "'" : ''
            const _pre2 = /[0-9a-zA-z_]+\(.+\)/g.test(i) ? '' : '`'
            _objAry.push(`${_pre2}${i}${_pre2}${i2}${_pre1}${o[i][i2]}${_pre1}`)
          }
          _item = _objAry.join(' and ')
          break
        }
        case 'undefined':
          _item = undefined // undefined不拼接
          break
        default:
      }
      if (_item) a.push(_item)
    }
    return a
  }
  me.find = function (a, b, c, d) {
    /*
    a where
    b col
    c order by
    d limit
    */
    const cols = []
    let colsStr = ''
    let whereStr = ''
    const order = []
    let orderStr = ''
    const limitStr = +d
    const field = me.db[_name].field
    // if (b === 0) b = _columnFilter(b) //TODO: 列可见性加强
    if (JSON.stringify(b) === '{}' || !b) {
      b = {}
      for (let i = 0; i < field.length; i++) {
        b[field[i]] = 1
      }
    }
    if (option.columnCamelize) {
      let b1 = {}
      for (let i in b) {
        b1[i.deCamelize('_')] = b[i]
      }
      b = b1
      let c1 = {}
      for (let i in c) {
        c1[i.deCamelize('_')] = c[i]
      }
      c = c1
    }

    for (const i in b) {
      // 判断列是否正确
      if (!field.includes(i.toLowerCase())) {
        me.errObj = { errCode: 400, msg: `列错误，表 ${_name} 没有 ${i} 列` }
        return me
      }
      if (option.columnCamelize) {
        cols.push('`' + i + '` as ' + i.camelize('_'))
      } else {
        cols.push('`' + i + '`')
      }
    }
    for (const i in c) {
      if (!field.includes(i.toLowerCase())) {
        me.errObj = {
          errCode: 400,
          msg: `ORDER BY错误，表 ${_name} 没有 ${i} 列`
        }
        return me
      }
      if (typeof c[i] === 'string') {
        if (c[i].toLowerCase() === 'asc') c[i] = 1
        if (c[i].toLowerCase() === 'desc') c[i] = -1
      }
      order.push('`' + i + '`' + ` ${+c[i] === -1 ? 'desc' : 'asc'}`)
    }
    orderStr = order.join(', ')

    colsStr = cols.join(',')
    const whereResult = me.where(a)

    whereStr = whereResult.join(' and ')
    sql += `select ${colsStr || '*'} from \`${_name}\`${
      whereStr ? ' where ' + whereStr : ''
    }${orderStr ? ' order by ' + orderStr : ''}${
      limitStr ? ' limit ' + limitStr : ''
    };`
    return me
  }
  me.findOne = function (a, b, c) {
    return me.find(a, b, c, 1)
  }
  me.remove = function (a, ifEmpty) {
    const whereResult = me.where(a)
    if (me.errObj) return me
    const whereStr = whereResult.join(' and ')
    if (me.errObj) return me
    if (whereStr || (ifEmpty && !whereStr)) {
      sql += `delete from \`${_name}\`${whereStr ? ' where ' + whereStr : ''};`
      return me
    } else {
      sql += '[Empty!!]'
      return me
    }
  }
  me.update = function (a, b, ifEmpty) {
    const whereStr = me.where(a).join(' and ')
    if (me.errObj) return me
    const colsStr = me.where(b, 'update').join(',')
    if (me.errObj) return me
    if (!colsStr) {
      sql += '[Empty!!]'
      return me
    }
    if (whereStr || (ifEmpty && !whereStr)) {
      sql += `update \`${_name}\` set ${colsStr}${
        whereStr ? ' where ' + whereStr : ''
      };`
      return me
    } else {
      sql += '[Empty!!]'
      return me
    }
  }
  me.insert = function (a, uniqCol) {
    const cols = []
    let values = []
    const vals = []
    let colsStr = ''
    let valuesStr = ''
    if (option.columnCamelize) {
      let a1 = {}
      for (let i in a) {
        a1[i.deCamelize('_')] = a[i]
      }
      a = a1
    }
    for (const i in a) {
      cols.push('`' + i + '`')
      values.push(a[i])
    }
    colsStr = cols.join(',')
    values = me.where(a, 'update')
    for (let i = 0; i < values.length; i++) {
      const a = values[i].split('=')
      a.shift(0)
      vals.push(a.join('='))
    }
    valuesStr = vals.join(',')
    if (!colsStr && !valuesStr) {
      sql += '[Empty!!]'
    } else {
      if (!uniqCol) {
        sql += `insert into \`${_name}\` (${colsStr}) values (${valuesStr});`
      } else {
        const _v = me.where({
          c: a[uniqCol]
        })
        const _a = _v[0].split('=')
        _a.shift(0)
        const _c = _a.join('=')
        sql += `insert into \`${_name}\` (${colsStr}) select ${valuesStr} from dual WHERE NOT EXISTS(SELECT \`${uniqCol}\` FROM \`${_name}\` WHERE \`${uniqCol}\` = ${_c}) limit 1;`
      }
    }
    return me
  }
  me.C = function (a, uniqCol) {
    return me.insert(a, uniqCol)
  }
  me.R = function (a, b, c, d) {
    return me.find(a, b, c, d)
  }
  me.U = function (a, b, ifEmpty) {
    return me.update(a, b, ifEmpty)
  }
  me.D = function (a, ifEmpty) {
    return me.remove(a, ifEmpty)
  }
  me.select = function (a, b, c, d) {
    return me.find(a, b, c, d)
  }
  me.delete = function (a, ifEmpty) {
    return me.remove(a, ifEmpty)
  }
  return me
}

module.exports = DbOpt
