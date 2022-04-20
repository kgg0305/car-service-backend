var express = require('express');
var router = express.Router();
var connection = require('../database');

/* GET home page. */
router.get('/', function(req, res, next) {
  	return res.status(200).json({ message: 'Welcome to Express API template' });
});

router.get('/list', function(req, res, next) {
    connection.query('SELECT * FROM backend_test_table', (error, rows, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    
        console.log(': ', rows);
        res.send(rows);
    });
});

module.exports = router;