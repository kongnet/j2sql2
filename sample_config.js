const dbObj = {
  host: '127.0.0.1', // ip或者域名
  port: 3306,
  pool: 1000,
  timeout: 500000,
  user: 'root',
  password: '123456',
  database: 'test',
  multipleStatements: true, // 允许运行多行SQL
  /*
      有crudExtend属性 就扩展 db['tableName'].ex属性，并检查数据库表是否有如下字段
      ex中的命令全部是默认 d_flag=0 条件的
    */
  crudExtend: {
    isDevMode: 1 // 默认开发模式打印sql语句
    /* delflagField: 'd_flag', // 默认逻辑删除标记
      createTimeField: 'c_time',
      modifyTimeField: 'm_time' */
  }
}
const redisObj = {
  host: '127.0.0.1',
  port: 32769,
  auth: '',
  db: 0,
  // 如果有此字段就会对，有key的操作的命令进行过滤,排序后判断，有限先满足带*号的规则，再满足普通规则
  keyLimit: ['x1', 'c*'] // '*' 全部允许
}
module.exports = {
  mysql: dbObj,
  redis: redisObj,
  dbscan: {
    mysql: dbObj,
    redis: redisObj,
    checkDB: ['test']
  }
}
