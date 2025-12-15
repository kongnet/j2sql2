const dbObj = {
  host: '127.0.0.1', // ip或者域名
  port: 3306,
  pool: 1000,
  timeout: 500000,
  user: 'root',
  password: '123456',
  database: 'test',
  multipleStatements: true, // 允许运行多行SQL
  supportBigNumbers: true, // bigInt js=>mysql支持
  bigNumberStrings: true,
  /*
      有crudExtend属性 就扩展 db['tableName'].ex属性，并检查数据库表是否有如下字段
      ex中的命令全部是默认 d_flag=0 条件的
    */
  crudExtend: {
    isDevMode: 1 // 默认开发模式打印sql语句
    /* delflagField: 'd_flag', // 默认逻辑删除标记
      createTimeField: 'c_time',
      modifyTimeField: 'm_time' */
  },
  extendOption: {
    columnCamelize: true
  }
}
const redisObj = {
  host: '127.0.0.1',
  port: 6379, // 默认 6379
  auth: '',
  db: 0,
  /*
  name: 'myMaster', // 哨兵模式必要设置
  sentinels: [
    { host: '172.31.17.81', port: 26379 }
  ],
  */
  // 如果有此字段就会对，有key的操作的命令进行过滤,排序后判断，有限先满足带*号的规则，再满足普通规则
  keyLimit: ['x1', 'c*'] // '*' 全部允许
}
const rabbitMQ = {
  protocol: 'amqp',
  hostname: 'localhost',
  port: 5672, // 默认 5672
  username: 'user', // guest
  password: 'user', // guest
  vhost: '/'
}
const mssqlObj = {
  user: '...',
  password: '...',
  server: '...',
  port: 1433,
  database: '...'
}
const dmdbObj = {
  // 必填参数
  user: 'SYSDBA', // 用户名
  password: 'SYSDBA', // 密码
  connectionString: 'localhost:5236', //'localhost:5236', // 连接字符串
  // 可选
  poolMax: 10,
  poolMin: 0,
  poolTimeout: 600,
  queueMax: 1000,
  queueTimeout: 15000, // 15秒超时 120000  2分钟
  queueRequests: true,
  schema: 'SYSDBA', // 默认模式，默认同用户名
  autoCommit: true, // 是否自动提交，默认true
  encoding: 'UTF-8', // 字符编码，默认UTF-8
  // 其他高级参数
  fetchRowSize: 100, // 每次获取的行数，默认100
  fetchAsString: [], // 将指定类型作为字符串获取，如 [dm.CLOB]
  fetchAsBuffer: [], // 将指定类型作为Buffer获取
  lobPrefetchSize: 16384 // LOB预取大小，默认16384
}
module.exports = {
  mssql: mssqlObj,
  mysql: dbObj,
  redis: redisObj,
  dmdb: dmdbObj,
  rabbitMQ,
  dbscan: {
    mysql: dbObj,
    redis: redisObj,
    checkDB: ['test']
  }
}
