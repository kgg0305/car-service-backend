var express = require('express');
var router = express.Router();
var connection = require('../database');
var cors = require('cors');

var app = express();
app.use(cors());

//   CREATE TABLE `tbl_brand` (
//     `idx` int(11) NOT NULL AUTO_INCREMENT,
//     `brand_name` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '브랜드 이름',
//     `sequence` int(11) NOT NULL COMMENT '순서',
//     `nation` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0' COMMENT '국가 => 0:국산, 1:미국, 2:유럽, 3:일본, 4:중국',
//     `is_use` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0' COMMENT '사용여부 => 0:사용, 1:미사용',
//     `is_income` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '수입여부 => 0:국산, 1:수입',
//     `public_uri` varchar(155) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '공식 사이트',
//     `room_uri` varchar(155) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '전시장 안내',
//     `service_uri` varchar(155) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '서비스 센터',
//     `deposit_uri` varchar(155) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '보증금 안내',
//     `logo` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '로고',
//     `is_delete` char(1) DEFAULT '0' COMMENT '삭제 여부',
//     `reg_date` datetime DEFAULT CURRENT_TIMESTAMP,
//     `up_date` datetime DEFAULT NULL,
//     `del_date` datetime DEFAULT NULL,
//     PRIMARY KEY (`idx`)
//   ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

const table_name = 'tbl_brand';
const table_fields = ['brand_name', 'sequence', 'nation', 'is_use', 'is_income', 'public_uri', 'room_uri', 'service_uri', 'deposit_uri', 'logo', 'is_delete', 'reg_date', 'up_date', 'del_date'];

router.get('/option-list', function(req, res, next) {
    const query = 'SELECT idx as value, brand_name as label FROM ??';

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
    
    if(req.body.idx) {
        where_array.push('idx = "' + req.body.idx + '"');
    }

    if(req.body.is_use) {
        where_array.push('is_use = ' + req.body.is_use);
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
    const brand_name = req.body.brand_name;
    const where_statement = 'brand_name = ?'
    const query = 'SELECT COUNT(*) as count FROM ' + table_name + ' WHERE ' + where_statement;

    connection.query(query, [brand_name], (error, result, fields) => {
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