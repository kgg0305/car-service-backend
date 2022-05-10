var express = require('express');
var router = express.Router();
var connection = require('../database');

//   CREATE TABLE `tbl_model` (
//     `idx` int(11) NOT NULL AUTO_INCREMENT,
//     `group_id` int(11) NOT NULL COMMENT '모델그룹아이디\n',
//     `brand_id` int(11) DEFAULT NULL COMMENT '브랜드 아이디',
//     `model_name` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '모델이름',
//     `is_new` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '신차여부=>0:네. 1: 아니요',
//     `release_date` date NOT NULL COMMENT '출시일',
//     `sequence` int(11) NOT NULL COMMENT '순서',
//     `is_use` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '사용여부=>0:사용, 1:미사용',
//     `picture_1` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '사진01',
//     `picture_2` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '사진02',
//     `picture_3` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '사진03',
//     `picture_4` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '사진04',
//     `picture_5` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '사진05',
//     `picture_6` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '사진06',
//     `picture_7` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '사진07',
//     `picture_8` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '사진08',
//     PRIMARY KEY (`idx`)
//   ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

const table_name = 'tbl_model';
const table_fields = [
    'group_id', 'brand_id', 'model_name', 'is_new', 'release_date', 'sequence', 'is_use', 
    'picture_1', 'picture_2', 'picture_3', 'picture_4', 'picture_5', 'picture_6', 'picture_7', 'picture_8'
];

const brand_table_name = 'tbl_brand';
const model_group_table_name = 'tbl_model_group';

router.get('/option-list', function(req, res, next) {
    const query = 'SELECT idx as value, model_name as label, brand_id, group_id FROM ??';

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
    const query =   'SELECT ' + table_name + '.*, ' + brand_table_name + '.brand_name, ' + brand_table_name + '.is_income, ' + model_group_table_name + '.group_name ' + 
                    'FROM ?? ' + 
                    'LEFT JOIN ' + brand_table_name + ' ON ' + table_name + '.brand_id = ' + brand_table_name + '.idx ' + 
                    'LEFT JOIN ' + model_group_table_name + ' ON ' + table_name + '.group_id = ' + model_group_table_name + '.idx ' + 
                    'WHERE ' + table_name + '.idx = ' + idx + ' LIMIT 0, 1';

    connection.query(query, table_name, (error, result, fields) => {
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

    if(req.body.group_id) {
        where_array.push(table_name + '.group_id = ' + req.body.group_id);
    }

    if(req.body.is_new) {
        where_array.push(table_name + '.is_new = ' + req.body.is_new);
    }

    if(req.body.is_use) {
        where_array.push(table_name + '.is_use = ' + req.body.is_use);
    }
    
    const where_statement = where_array.length != 0 ? 'AND ' + where_array.join(' AND ') : '';

    const query =   'SELECT ' + table_name + '.*, ' + brand_table_name + '.brand_name, ' + model_group_table_name + '.group_name ' + 
                    'FROM ?? ' + 
                    'LEFT JOIN ' + brand_table_name + ' ON ' + table_name + '.brand_id = ' + brand_table_name + '.idx ' + 
                    'LEFT JOIN ' + model_group_table_name + ' ON ' + table_name + '.group_id = ' + model_group_table_name + '.idx ' + 
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
    const model_name = req.body.model_name;
    const where_statement = 'model_name = ?'
    const query = 'SELECT COUNT(*) as count FROM ' + table_name + ' WHERE ' + where_statement;

    connection.query(query, [model_name], (error, result, fields) => {
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