var mysql = require("mysql");

// Connection DB
var connection = mysql.createConnection({
  host: process.env.MySQLDB_HOST,
  user: process.env.MySQLDB_USER,
  password: process.env.MySQLDB_PASSWORD,
  port: process.env.MySQLDB_PORT,
  database: process.env.MySQLDB_NAME,
});

// Connection
connection.connect(function (err) {
  if (err) {
    console.error(err.message);
    return;
  }
  console.error("database connected.");
});

module.exports = connection;
