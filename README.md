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