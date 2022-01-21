/* global isDevMode */
'use strict'
const $ = require('meeko')
const rejsonCommand = [
  //'JSON.DEL',
  //'JSON.GET',
  //'JSON.MGET',
  //'JSON.SET',
  'JSON.TYPE',
  'JSON.CLEAR',
  //'JSON.TOGGLE',
  //'JSON.NUMINCRBY',
  //'JSON.NUMMULTBY',
  //'JSON.STRAPPEND',
  'JSON.STRLEN',
  //'JSON.ARRAPPEND',
  //'JSON.ARRINDEX',
  //'JSON.ARRINSERT',
  'JSON.ARRLEN',
  //'JSON.ARRPOP',
  'JSON.ARRTRIM',
  'JSON.OBJKEYS',
  'JSON.OBJLEN',
  'JSON.DEBUG',
  'JSON.FORGET',
  'JSON.RESP'
]


module.exports = async function (rd) {
  rejsonCommand.map(item => {
    const cmdName = item.toLow().replace('json.', 'j')
    rd[cmdName] = function (...arg) {
      return rd.createBuiltinCommand(item).string.apply(rd, arg)
    }
  })

  rd['jset'] = function (key, path, value) {
    let val = JSON.stringify(value)
    return rd.createBuiltinCommand('JSON.SET').string.call(rd, key, path, val).then(function (r) {
      if (r === 'OK') {
        return true
      }
      throw new Error(r)
    })
  }
  rd['jdel'] = function (key, path) {
    return rd.createBuiltinCommand('JSON.DEL').string.call(rd, key, path).then(function (r) {
      return r
    })
  }
  rd['jforget'] = function (key, path) {
    return rd.createBuiltinCommand('JSON.FORGET').string.call(rd, key, path).then(function (r) {
      return r
    })
  }
  rd['jget'] = function (key, path) {
    return rd.createBuiltinCommand('JSON.GET').string.call(rd, key, path).then(function (value) {
      return JSON.parse(value)

    })
  }
  rd['jmget'] = function (...arg) {
    return rd.createBuiltinCommand('JSON.MGET').string.apply(rd, arg).then(function (r) {
      return r.map(v => JSON.parse(v))
    })
  }
  rd['jstrappend'] = function (key, path, value) {
    let val = JSON.stringify(value)
    return rd.createBuiltinCommand('JSON.STRAPPEND').string.call(rd, key, path, val).then(function (r) {
      return r
    })
  }
  rd['jnumincrby'] = function (key, path, num) {
    return rd.createBuiltinCommand('JSON.NUMINCRBY').string.call(rd, key, path, num).then(function (r) {
      const rst = JSON.parse(r)
      return typeof rst === 'number' ? parseFloat(rst) : rst.map(v => parseFloat(v) || null)
    })
  }
  rd['jtoggle'] = function (key, path) {
    return rd.createBuiltinCommand('JSON.TOGGLE').string.call(rd, key, path).then(function (r) {

      return typeof r === 'string' ? JSON.parse(r) : r.map(v => parseInt(v) || null)
    })
  }

  rd['jnummultby'] = function (key, path, num) {
    return rd.createBuiltinCommand('JSON.NUMMULTBY').string.call(rd, key, path, num).then(function (r) {
      const rst = JSON.parse(r)
      return typeof rst === 'number' ? parseFloat(rst) : rst.map(v => parseFloat(v) || null)
    })
  }

  rd['jarrindex'] = function (key, path, scalar) {
    return rd.createBuiltinCommand('JSON.ARRINDEX').string.call(rd, key, path, JSON.stringify(scalar))
  }

  rd['jarrpop'] = function (key, path, idx) {
    return rd.createBuiltinCommand('JSON.ARRPOP').string.call(rd, key, path, idx).then(function (r) {
      return JSON.parse(r)
    })
  }
  rd['jarrinsert'] = function (...arg) {
    let preThree = arg.slice(0, 3)
    let rest = arg.slice(3).map(item => JSON.stringify(item))
    return rd.createBuiltinCommand('JSON.ARRINSERT').string.apply(rd, preThree.concat(rest));
  }
  rd['jarrappend'] = function (...arg) {
    let preTwo = arg.slice(0, 2)
    let rest = arg.slice(2).map(item => JSON.stringify(item))
    return rd.createBuiltinCommand('JSON.ARRAPPEND').string.apply(rd, preTwo.concat(rest))
  }
}
