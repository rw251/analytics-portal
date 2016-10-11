module.exports = {
  mysql: {
    host: process.env.MUJO_MYSQL_HOST,
    user: process.env.MUJO_MYSQL_USER,
    password: process.env.MUJO_MYSQL_PASSWORD,
    database: process.env.MUJO_MYSQL_DB
  },
  aws_mysql: {
    host: process.env.MUJO_AWS_MYSQL_HOST,
    user: process.env.MUJO_AWS_MYSQL_USER,
    password: process.env.MUJO_AWS_MYSQL_PASSWORD,
    database: process.env.MUJO_AWS_MYSQL_DB
  },
  passport: {
    secret: process.env.MUJO_PASSPORT_SECRET
  },
  server: {
    port: process.env.MUJO_SERVER_PORT
  },
  mongo: {
    url: process.env.MUJO_MONGO_URL
  }
};
