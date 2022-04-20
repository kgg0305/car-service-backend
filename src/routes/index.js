var express = require('express');
var mysql = require('mysql');
var router = express.Router();

// Connection DB
var connection = mysql.createConnection({
    host: 'automobile_dev.content-auto-prod.cluster-cwvtgy0jxm2o.ap-northeast-2.rds.amazonaws.com', 
    user: 'auto_dev', 
    password: 'auto_dev12#', 
    port: 3306, 
    database: 'automobile_dev' 
});

// Connection
connection.connect(function (err) {
    if(err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  	return res.status(200).json({ message: 'Welcome to Express API template' });
});

router.get('/list', function(req, res, next) {
	connection.query('SELECT * FROM backend_test_table', function (err, rows) {
		if(err) throw err;
		res.send(rows);
	});
});

module.exports = router;
