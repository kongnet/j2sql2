# j2sql2
enhance j2sql use ioredis mysql-promise

###
npm i j2sql2

导入 sample.sql

node sample.js


> 在使用对象提交sql的情况下,增强如下功能
* 对where条件是否有包含此列
* 对column是否有包含此列
* 对order by是否有包含此列
* 对string 和 number类型进行预检测
* 同时封装mysql 和 redis 详见sample.js

> 如果有mysql.crudExtend 就扩展 db['tableName'].ex属性，并检查数据库表是否有如下字段,都基于d_flag字段
``` javascript
mysql:{
    crudExtend: {
      isDevMode: 1 // 默认开发模式打印sql语句
      /* delflagField: 'd_flag', // 默认逻辑删除标记
      createTimeField: 'c_time',
      modifyTimeField: 'm_time' */
    }
}
```
* 详见crud.js
* page, 分页
* list,
* insert,
* update,
* remove,
* clear,
* getById,
* removeById,
* deleteById,
* updateById,
* addById 列增加
