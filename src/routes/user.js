var express = require('express');
var router = express.Router();
var connection = require('../database');

//   CREATE TABLE `tbl_user` (
//     `idx` int(11) NOT NULL AUTO_INCREMENT,
//     `type_id` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0' COMMENT '구분=>0:콘텐츠, 1:자동차',
//     `group_id` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
//     `name` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `user_id` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `phone` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `email` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `password` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     PRIMARY KEY (`idx`)
//   ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

const table_name = 'tbl_user';
const table_fields = ['type_id', 'group_id', 'name', 'user_id', 'phone', 'email', 'password'];

const group_table_name = 'tbl_model_group';

router.get('/option-list', function(req, res, next) {
    const query = 'SELECT idx as value, name as label FROM ??';

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
    const query = 'SELECT ' + table_name + '.*, ' + group_table_name + '.group_name ' + 
                'FROM ' + table_name + ' ' +
                'LEFT JOIN ' + group_table_name + ' ON ' + table_name + '.group_id = ' + group_table_name + '.idx ' + 
                'WHERE ' + table_name + '.idx = ? LIMIT 0, 1';

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
    
    if(req.body.type_id) {
        where_array.push('type_id = \'' + req.body.type_id + '\'');
    }

    if(req.body.group_id) {
        where_array.push('group_id = ' + req.body.group_id);
    }

    if(req.body.name) {
        where_array.push('name = \'' + req.body.name + '\'');
    }
    
    const where_statement = where_array.length != 0 ? 'AND ' + where_array.join(' AND ') : '';

    const query =   'SELECT ' + table_name + '.*, ' + group_table_name + '.group_name ' + 
                    'FROM ?? ' + 
                    'LEFT JOIN ' + group_table_name + ' ON ' + table_name + '.group_id = ' + group_table_name + '.idx ' + 
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
    const name = req.body.name;
    const where_statement = 'name = ?'
    const query = 'SELECT COUNT(*) as count FROM ' + table_name + ' WHERE ' + where_statement;

    connection.query(query, [name], (error, result, fields) => {
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