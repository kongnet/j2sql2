/* global isDevMode */
'use strict'
const $ = require('meeko')
function extendDB (exObj = {}, db, tableName, option = {}) {
  if (!tableName || !db[tableName]) {
    $.err($.c.r('表在此数据库中不存在'))
    return { errCode: 400, msg: '表在此数据库中不存在' }
  }

  const optionDefault = {
    isDevMode: 1,
    delflagField: 'd_flag', // 默认
    createTimeField: 'c_time',
    modifyTimeField: 'm_time'
  }

  option = Object.assign(optionDefault, option)
  const isDevMode = option.isDevMode == 0 ? 0 : 1 // 这边是两个=

  if (
    !db[tableName].field.includes(option.delflagField) ||
    !db[tableName].field.includes(option.createTimeField) ||
    !db[tableName].field.includes(option.modifyTimeField)
  ) {
    $.err(
      $.c.r(
        `ex扩展失败 ${tableName} 表需要有删除标记：${
          option.delflagField
        } 创建时间：${option.createTimeField} 修改时间：${
          option.modifyTimeField
        }`
      )
    )
    return {
      errCode: 400,
      msg: `${tableName} 表需要有删除标记：${option.delflagField} 创建时间：${
        option.createTimeField
      } 修改时间：${option.modifyTimeField}`
    }
  }
  async function page2 (whereObj, colObj, pageNum, num, key, ifDesc) {
    // 简单使用limit排序
    pageNum = pageNum || 1
    num = num || 20
    key = key || 'id'
    ifDesc = !!ifDesc
    let exWhere = 'and d_flag=0 '
    if (!$.tools.ifObjEmpty(whereObj, null)) {
      exWhere += ' and ' + db[tableName].where(whereObj).join(' and ')
    }
    const sql = `${db[tableName]
      .R({}, colObj)
      .get()
      .replace(/;$/g, ' ')} where 1=1 ${exWhere} order by ${key} ${
      ifDesc ? 'desc' : 'asc'
    } limit ${(pageNum - 1) * num},${num}`
    return db[tableName].cmd(sql).run(0, isDevMode)
  }
  async function page (whereObj, colObj, pageNum, num, key, ifDesc) {
    // let r = await ip.page({price: {'>=': 100000,'<':1000000}}, {id: 1, price: 1}, 2, 1, 'price', true)
    pageNum = pageNum || 1
    num = num || 20
    key = key || 'id'
    ifDesc = !!ifDesc
    let exWhere = 'and d_flag=0 '
    if (!$.tools.ifObjEmpty(whereObj, null)) {
      exWhere += ' and ' + db[tableName].where(whereObj).join(' and ')
    }
    const sql = `${db[tableName]
      .R({}, colObj)
      .get()
      .replace(/;$/g, ' ')} where ${key} ${
      ifDesc ? '<=' : '>='
    } (select ${key} from ${tableName} where 1=1 ${exWhere} order by ${key} ${
      ifDesc ? 'desc' : 'asc'
    }  limit ${(pageNum - 1) * num}, 1) ${exWhere} order by ${key} ${
      ifDesc ? 'desc' : 'asc'
    } limit 0,${num}`
    return db[tableName].cmd(sql).run(0, isDevMode)
  }

  // 排除d_flag=1的
  async function list (whereObj, colObj, orderObj, n) {
    const len = n || 10000
    const where = whereObj || {}
    const columns = colObj || {}
    const order = orderObj || { c_time: -1 }
    where.d_flag = 0
    return db[tableName].R(where, columns, order, len).run(0, isDevMode)
  }

  async function remove (whereObj) {
    if (whereObj) {
      return db[tableName].U(whereObj, { d_flag: 1 }).run(0, isDevMode)
    } else {
      $.err('删除条件不能为空!')
      return { errCode: 400, msg: '删除条件不能为空!' }
    }
  }

  async function clear () {
    return db[tableName].D({ d_flag: 1 }).run(0, isDevMode)
  }

  async function update (whereObj, colObj) {
    if (whereObj && colObj) {
      return db[tableName].U(whereObj, colObj).run(0, isDevMode)
    } else {
      $.err('更新条件不能为空!')
      return { errCode: 400, msg: '更新条件不能为空!' }
    }
  }

  async function insert (colObj) {
    if (colObj) {
      return db[tableName].C(colObj).run(0, isDevMode)
    } else {
      $.err('插入条件不能为空!')
      return { errCode: 400, msg: '插入条件不能为空!' }
    }
  }

  async function getById (id) {
    if (id) {
      return db[tableName].R({ id: id, d_flag: 0 }).run(0, isDevMode)
    } else {
      $.err('id输入有误!')
      return { errCode: 400, msg: 'id输入有误!' }
    }
  }

  async function removeById (id) {
    if (id) {
      return db[tableName]
        .U({ id: id, d_flag: 0 }, { d_flag: 1 })
        .run(0, isDevMode)
    } else {
      $.err('id输入有误!')
      return { errCode: 400, msg: 'id输入有误!' }
    }
  }

  // 目前同removeById 只逻辑删除
  async function deleteById (id) {
    if (id) {
      return db[tableName].D({ id: id }, 1).run(0, isDevMode)
    } else {
      $.err('id输入有误!')
      return { errCode: 400, msg: 'id输入有误!' }
    }
  }

  async function updateById (id, colObj) {
    if (colObj) {
      if (colObj.id) delete colObj.id
      return db[tableName].U({ id: id, d_flag: 0 }, colObj).run(0, isDevMode)
    } else {
      $.err('更新字段输入有误!')
      return { errCode: 400, msg: '更新字段输入有误!' }
    }
  }
  async function addById (id, colValue) {
    // {viewCount:2,dropCount:-1} 加2 减1
    if (colValue) {
      const obj = {}
      for (const i in colValue) {
        obj[i] = `${i} + greatest(${colValue[i]},${colValue[i]})` // 如果是字符串 需要再多两个 \'
      }
      return db[tableName].U({ id: id, d_flag: 0 }, obj, true).run(0, isDevMode)
    } else {
      $.err('自加字段输入有误!')
      return { errCode: 400, msg: '自加字段输入有误!' }
    }
  }
  /***
        其他方法写在注解之后
    ***/
  const dbOpt = {
    page,
    page2,
    list,
    insert,
    update,
    remove,
    clear,
    getById,
    removeById,
    deleteById,
    updateById,
    addById
  }
  // if (userModelsLoad) {
  const o = $.ext(exObj, dbOpt)
  // }
  return o
}
module.exports = extendDB
