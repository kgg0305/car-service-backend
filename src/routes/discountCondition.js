var express = require('express');
var router = express.Router();
var connection = require('../database');

//   CREATE TABLE `tbl_discount_condition` (
//     `idx` int(11) NOT NULL AUTO_INCREMENT,
//     `discount_kind_id` int(11) DEFAULT NULL COMMENT '할인종류 아아디',
//     `condition_name` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '할인 조건 명',
//     `discount_price` int(11) DEFAULT NULL COMMENT '가격',
//     `price_unit` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '가격단위',
//     PRIMARY KEY (`idx`)
//   ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  

const table_name = 'tbl_discount_condition';
const table_fields = ['discount_kind_id', 'condition_name', 'discount_price', 'price_unit'];

router.get('/option-list', function(req, res, next) {
    const query = 'SELECT idx as value, kind_name as label FROM ??';

    connection.query(query, table_name, (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }

        res.send(result);
    });
});

router.get('/:idx', function(req, res, next) {
    const idx = req.params.idx;
    const query = 'SELECT * FROM ' + table_name + ' WHERE idx = ? LIMIT 0, 1';

    connection.query(query, [idx], (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result ? result[0] : null);
    });
});

router.post('/', function(req, res, next) {    
    var field_names = table_fields.join(', ');
    var field_values;
    var field_value_list = [];

    if(Array.isArray(req.body)) {
        temp_field_values = [];
        req.body.map( item => 
            {
                temp_field_values.push('(' + table_fields.map(x => '?').join(', ') + ')')
                field_value_list = [...field_value_list, ...table_fields.map(x => item[x])];
            }
        );

        field_values = temp_field_values.join(', ')
    } else {
        field_values = '(' + table_fields.map(x => '?').join(', ') + ')';
        field_value_list = table_fields.map(x => req.body[x]);
    }
    
    const query = 'INSERT INTO ' + table_name + '(' + field_names + ') VALUES ' + field_values;
    connection.query(query, field_value_list, (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result);
    });
});

router.post('/list/:offset?', function(req, res, next) {
    const offset = req.params.offset ? req.params.offset : 0;
    
    var where_array = [];
    
    if(req.body.discount_kind_id) {
        where_array.push(table_name + '.discount_kind_id = ' + req.body.discount_kind_id);
    }
    
    const where_statement = where_array.length != 0 ? 'AND ' + where_array.join(' AND ') : '';

    const query = 'SELECT * FROM ?? WHERE idx > 0 ' + where_statement + ' LIMIT ' + offset + ', 10';

    connection.query(query, table_name, (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result);
    });
});

router.post('/check-name', function(req, res, next) {
    const condition_name = req.body.condition_name;
    const where_statement = 'condition_name = ?'
    const query = 'SELECT COUNT(*) as count FROM ' + table_name + ' WHERE ' + where_statement;

    connection.query(query, [condition_name], (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result[0].count == 0 ? { exist: false } : { exist: true });
    });
});

router.put('/:idx', function(req, res, next) {
    var idx = req.params.idx;
    const field_names = table_fields.map(x => x + ' = ?').join(', ');
    const field_value_list = table_fields.map(x => req.body[x]);

    const query = 'UPDATE ' + table_name + ' SET ' + field_names + ' WHERE idx = ' + idx;
    connection.query(query, field_value_list, (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result);
    });
});

router.delete('/:idx', function(req, res, next) {
    var idx = req.params.idx;
    const query = 'DELETE FROM ' + table_name + ' WHERE idx = ?';
    connection.query(query, [idx], (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result.affectedRows ? true : false);
    });
});

module.exports = router;