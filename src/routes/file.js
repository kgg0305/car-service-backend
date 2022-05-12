var express = require('express');
var multer = require('multer');
const excel = require("exceljs");
var connection = require('../database');

var app = express();
var router = express.Router();
var brandUpload = multer({ dest: process.env.Image_PATH + '/uploads/brand/'});

router.post('/', brandUpload.array('files'), function(req, res, next) {    
    res.send(req.files);
    console.log(req.files);
    console.log(req.type);
});

router.post('/brand', brandUpload.single('logo'), function(req, res, next) {    
    res.send(req.file);
});

router.delete('/:idx', function(req, res, next) {
    
});

router.get('/download/extra', function(req, res, next) {
    const query = 'SELECT * FROM tbl_extra';

    connection.query(query, (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }

        let work_book = new excel.Workbook();
        let work_sheet = work_book.addWorksheet('example');
        work_sheet.columns = [
            { header: 'Id', key: 'idx', width: 5},
            { header: 'BrandId', key: 'brand_id', width: 5},
            { header: 'GroupId', key: 'group_id', width: 5},
            { header: 'ModelId', key: 'model_id', width: 5}
        ];
        work_sheet.addRows(result);
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'tutorials.xlsx'
        );

        work_book.xlsx.write(res).then(function () {
            res.send();
        });
    });
});

module.exports = router;