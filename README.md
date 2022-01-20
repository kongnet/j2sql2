# j2sql2

enhance j2sql use ioredis mysql-promise mssql

###

npm i j2sql2

导入 sample.sql

node sample.js

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
