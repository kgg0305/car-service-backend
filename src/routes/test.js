var express = require('express');
var router = express.Router();
var connection = require('../database');

//   CREATE TABLE `book` (
//     `id` bigint(20) NOT NULL AUTO_INCREMENT,
//     `ISBN` tinytext,
//     `Author` tinytext,
//     `Title` tinytext,
//     `Year` int(11) DEFAULT NULL,
//     PRIMARY KEY (`id`)
//   ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
//   SELECT * FROM test.book;

const table_name = 'book';
const table_fields = ['ISBN', 'Author', 'Title', 'Year'];

router.get('/', function(req, res, next) {
    const query = 'SELECT * FROM ??';
    connection.query(query, table_name, (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result);
    });
});

router.post('/', function(req, res, next) {
    const field_names = table_fields.join(', ');
    const field_values = table_fields.map(x => '?').join(', ');
    const field_value_list = table_fields.map(x => req.body[x]);

    const query = 'INSERT INTO ' + table_name + '(' + field_names + ') VALUES (' + field_values + ')';
    connection.query(query, field_value_list, (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result);
    });
});

router.put('/:id', function(req, res, next) {
    const field_names = table_fields.map(x => x + ' = ?').join(', ');
    const field_value_list = table_fields.map(x => req.body[x]);

    const query = 'UPDATE ' + table_name + ' SET ' + field_names + ' WHERE id = ' + id;
    connection.query(query, field_value_list, (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result);
    });
});

router.delete('/:id', function(req, res, next) {
    var id = req.params.id;
    const query = 'DELETE FROM ' + table_name + ' WHERE id = ?';
    connection.query(query, [id], (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result);
    });
});

module.exports = router;