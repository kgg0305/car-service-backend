var express = require('express');
var multer = require('multer');
const excel = require("exceljs");
var connection = require('../database');

var app = express();
var router = express.Router();
var brandUpload = multer({ dest: process.env.Image_PATH + '/uploads/brand/'});

router.post('/', brandUpload.array('files'), function(req, res, next) {    
    res.send(req.files);
});

router.post('/brand', brandUpload.single('logo'), function(req, res, next) {    
    res.send(req.file);
});

router.delete('/:idx', function(req, res, next) {
    
});

router.post('/download/extra', function(req, res, next) {
    const query = 'SELECT * FROM tbl_extra';

    connection.query(query, (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }

        let work_book = new excel.Workbook();
        let work_sheet = work_book.addWorksheet('취득세');
        work_sheet.columns = [
            { header: 'ID', key: 'idx', width: 15},
            { header: '모델ID', key: 'brand_id', width: 15},
            { header: '배기량', key: 'condition', width: 15},
            { header: '등록지역', key: 'region', width: 15},
            { header: '취득세', key: 'fee', width: 15},
            { header: '채권할인', key: 'discount', width: 15},
            { header: '탁송', key: 'transfer', width: 15}
        ];
        work_sheet.addRows(result);
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'extra.xlsx'
        );

        work_book.xlsx.write(res).then(function () {
            res.send();
        });
    });
});

router.post('/download/extra', function(req, res, next) {
    const query = 'SELECT * FROM tbl_extra';

    connection.query(query, (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }

        let work_book = new excel.Workbook();
        let work_sheet = work_book.addWorksheet('취득세');
        work_sheet.columns = [
            { header: 'ID', key: 'idx', width: 15},
            { header: '모델ID', key: 'brand_id', width: 15},
            { header: '배기량', key: 'condition', width: 15},
            { header: '등록지역', key: 'region', width: 15},
            { header: '취득세', key: 'fee', width: 15},
            { header: '채권할인', key: 'discount', width: 15},
            { header: '탁송', key: 'transfer', width: 15}
        ];
        work_sheet.addRows(result);
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'extra.xlsx'
        );

        work_book.xlsx.write(res).then(function () {
            res.send();
        });
    });
});

module.exports = router;