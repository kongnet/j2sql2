# j2sql2

## 这是什么库？ (What is this library?)

**j2sql2** 是一个 Node.js 数据库抽象层库，提供统一的 API 来访问和操作多种数据库和消息队列系统。

**j2sql2** is a Node.js database abstraction layer that provides a unified API for accessing and operating multiple databases and message queue systems.

### 核心功能 (Core Features)

- 🗄️ **多数据库支持**: 统一接口支持 MySQL、Redis、MSSQL、达梦数据库(DMDB)
- 🔧 **增强的 CRUD 操作**: 内置分页、条件查询、字段验证等功能
- 🔄 **驼峰命名转换**: 自动转换数据库字段名为 camelCase 格式
- 🛡️ **Redis Key 限制**: 内置 Redis key 访问控制和 ReJSON 支持
- 📝 **逻辑删除**: 支持软删除和时间戳自动管理
- 🐰 **RabbitMQ 支持**: 集成消息队列功能
- ✅ **类型检测**: 自动检测和验证字段类型

### 安装 (Installation)

```bash
npm i j2sql2
```

### 快速开始 (Quick Start)

```bash
# 导入示例数据库
mysql < sample.sql

# 运行示例代码
node sample.js
```

#### 基本使用示例 (Basic Usage Example)

```javascript
const SkyDB = require('j2sql2')

// 创建实例
const skyDB = new SkyDB({
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'test'
  },
  redis: {
    host: 'localhost',
    port: 6379
  }
})

// 使用 MySQL
const db = await skyDB.mysql
const result = await db.run('SELECT * FROM users WHERE id = ?', [1])

// 使用 Redis
const rd = await skyDB.redis
await rd.set('key', 'value')
const value = await rd.get('key')

// 使用增强的 CRUD 操作
const users = await db.users.ex.list({ status: 1 })
const page = await db.users.ex.page(null, null, 10, 1)
```

#### 达梦数据库测试 (DMDB Testing)

 > **目前支持 node 16** (Currently supports Node.js 16)
 
```bash
node sample_dm.js
```

### 关键字和表的冲突

> 不要使用以下关键字作为数据库表名

pool
\_mysql
format
cmd
run
genData

### check 增强

> 在使用对象提交 sql 的情况下,增强如下功能

- 对 where 条件是否有包含此列
- 对 column 是否有包含此列
- 对 order by 是否有包含此列
- 对 string 和 number 类型进行预检测
- 同时封装 mysql 和 redis 详见 sample.js

> 如果数据库配置文件中打开如下配置，将返回和接受，camel 形式的列名，例如 cTime => c_time ..

```javascript
extendOption: {
  columnCamelize: true
}
```

> 如果有 mysql.crudExtend 就扩展 db['tableName'].ex 属性，并检查数据库表是否有如下字段,都基于 d_flag 字段

```javascript
mysql: {
  crudExtend: {
    isDevMode: 1 // 默认开发模式打印sql语句
    /* delflagField: 'd_flag', // 默认逻辑删除标记
      createTimeField: 'c_time',
      modifyTimeField: 'm_time' */
  }
}
```

```javascript
redis: {
  keyLimit: ['x1', 'c*'] // '*' 全部允许
}
// 也可以通过redis实例 redis.keysLimit.add('*') or redis.keysLimit.status = 0 全部允许(关闭过滤)
// 详见 sample.js
```
```javascript
    // reJson 支持    
    let r = (await rd.jset('sky', '.', { 'x': 1 })) 
    console.log('reJson Test', r)
    r = (await rd.jget('sky', '.')) 
    console.log('reJson Test', r)
    
// 详见 sample.js
```
```javascript
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
```

- 详见 crud.js
- page, 分页
- list,
- insert,
- update,
- remove,
- clear,
- getById,
- removeById,
- deleteById,
- updateById,
- addById 列增加
