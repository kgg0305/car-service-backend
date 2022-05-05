var express = require('express');
var multer = require('multer');

var app = express();
var router = express.Router();
var brandUpload = multer({ dest: '/var/www/html/uploads/brand/'});

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

module.exports = router;