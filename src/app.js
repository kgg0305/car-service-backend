var logger = require('morgan');
var express = require('express');
var cookieParser = require('cookie-parser');
var indexRouter = require('./routes/index');
var mysql = require('mysql');
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', indexRouter);

// Connection DB
var connection = mysql.createConnection({
    host:'zum-auto-production.cluster-cwvtgy0jxm2o.ap-northeast-2.rds.amazonaws.com', 
    user:'fastview', 
    password:'daily-!hero-!!1-cat!-!seoul!', 
    port:3306, 
    database:'zum-auto-server_production' 
});

// Connection
connection.connect(function (err) {
    if(err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
});

module.exports = app;