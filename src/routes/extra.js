var express = require('express');
var router = express.Router();
var connection = require('../database');

//   CREATE TABLE `tbl_extra` (
//     `idx` int(11) NOT NULL AUTO_INCREMENT,
//     `brand_id` int(11) DEFAULT NULL,
//     `group_id` int(11) DEFAULT NULL,
//     `model_id` int(11) DEFAULT NULL,
//     `region` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `condition` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `fee` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `discount` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `transfer` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     PRIMARY KEY (`idx`)
//   ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

const table_name = 'tbl_extra';
const table_fields = ['brand_id', 'group_id', 'model_id', 'region', 'condition', 'fee', 'discount', 'transfer'];

const brand_table_name = 'tbl_brand';
const group_table_name = 'tbl_model_group';
const model_table_name = 'tbl_model';

router.get('/option-list', function(req, res, next) {
    const query = 'SELECT idx as value, region as label FROM ??';

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
    
    if(req.body.model_id) {
        where_array.push(table_name + '.model_id = ' + req.body.model_id);
    }
    
    const where_statement = where_array.length != 0 ? 'AND ' + where_array.join(' AND ') : '';

    const query =   'SELECT ' + table_name + '.*, ' + brand_table_name + '.brand_name, ' + group_table_name + '.group_name, ' + model_table_name + '.model_name ' + 
                    'FROM ?? ' + 
                    'LEFT JOIN ' + brand_table_name + ' ON ' + table_name + '.brand_id = ' + brand_table_name + '.idx ' + 
                    'LEFT JOIN ' + group_table_name + ' ON ' + table_name + '.group_id = ' + group_table_name + '.idx ' + 
                    'LEFT JOIN ' + model_table_name + ' ON ' + table_name + '.model_id = ' + model_table_name + '.idx ' + 
                    'WHERE ' + table_name + '.idx > 0 ' + where_statement + ' LIMIT ' + offset + ', 10';

    connection.query(query, table_name, (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result);
    });
});

router.post('/check-name', function(req, res, next) {
    const region = req.body.region;
    const where_statement = 'region = ?'
    const query = 'SELECT COUNT(*) as count FROM ' + table_name + ' WHERE ' + where_statement;

    connection.query(query, [region], (error, result, fields) => {
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