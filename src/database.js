var mysql = require('mysql');

// Connection DB
// var connection = mysql.createConnection({
//     host: 'content-auto-prod.cluster-cwvtgy0jxm2o.ap-northeast-2.rds.amazonaws.com', 
//     user: 'auto_dev', 
//     password: 'auto_dev12#', 
//     port: 3306, 
//     database: 'automobile_dev' 
// });

var connection = mysql.createConnection({
    host: '127.0.0.1', 
    user: 'root', 
    password: '', 
    port: 3306, 
    database: 'automobile_dev' 
});

// Connection
connection.connect(function (err) {
    if(err) {
        console.error(err.message);
        return;
    }
    console.error('database connected.');
});

module.exports = connection;