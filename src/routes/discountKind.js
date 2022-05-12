var express = require('express');
var router = express.Router();
var connection = require('../database');

//   CREATE TABLE `tbl_discount_kind` (
//     `idx` int(11) NOT NULL AUTO_INCREMENT,
//     `brand_id` int(11) DEFAULT NULL COMMENT '브랜드 아이디',
//     `kind_name` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '할인 종류 이름',
//     `kind_detail` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '할인 종류 세부내용',
//     `s_date` date DEFAULT NULL COMMENT '시작일',
//     `e_date` date DEFAULT NULL COMMENT '종료일',
//     PRIMARY KEY (`idx`)
//   ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

const table_name = 'tbl_discount_kind';
const table_fields = ['brand_id', 'kind_name', 'kind_detail', 's_date', 'e_date'];

const brand_table_name = 'tbl_brand';
const discount_condition_table_name = 'tbl_discount_condition';

router.get('/option-list', function(req, res, next) {
    const query = 'SELECT idx as value, kind_name as label, brand_id FROM ??';

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
    
    if(req.body.brand_id) {
        where_array.push(table_name + '.brand_id = ' + req.body.brand_id);
    }

    if(req.body.idx) {
        where_array.push(table_name + '.idx = ' + req.body.idx);
    }

    if(req.body.s_date) {
        where_array.push(table_name + '.s_date >= \'' + req.body.s_date + '\'');
    }

    if(req.body.e_date) {
        where_array.push(table_name + '.e_date <= \'' + req.body.e_date + '\'');
    }
    
    const where_statement = where_array.length != 0 ? 'AND ' + where_array.join(' AND ') : '';

    const query =   'SELECT ' + table_name + '.*, ' + brand_table_name + '.brand_name, ' + discount_condition_table_name + '.condition_name, ' + discount_condition_table_name + '.discount_price ' +
                    'FROM ?? ' + 
                    'LEFT JOIN ' + brand_table_name + ' ON ' + table_name + '.brand_id = ' + brand_table_name + '.idx ' + 
                    'LEFT JOIN ' + discount_condition_table_name + ' ON ' + table_name + '.idx = ' + discount_condition_table_name + '.discount_kind_id ' + 
                    'WHERE ' + table_name + '.idx > 0 ' + where_statement + ' LIMIT ' + offset + ', 10';
console.log(query);
    connection.query(query, table_name, (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result);
    });
});

router.post('/check-name', function(req, res, next) {
    const kind_name = req.body.kind_name;
    const where_statement = 'kind_name = ?'
    const query = 'SELECT COUNT(*) as count FROM ' + table_name + ' WHERE ' + where_statement;

    connection.query(query, [kind_name], (error, result, fields) => {
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