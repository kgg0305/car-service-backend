var express = require('express');
var router = express.Router();
var connection = require('../database');

//   CREATE TABLE `book` (
//     `id` bigint(20) NOT NULL AUTO_INCREMENT,
//     `ISBN` tinytext,
//     `Author` tinytext,
//     `Title` tinytext,
//     `Year` int(11) DEFAULT NULL,
//     PRIMARY KEY (`id`)
//   ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
//   SELECT * FROM test.book;


router.get('/', function(req, res, next) {
    const query = 'SELECT * FROM book';
    connection.query(query, (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result);
    });
});

router.post('/create', function(req, res, next) {
    var isbn = req.body.isbn;
    var author = req.body.author;
    var title = req.body.title;
    var year = req.body.year;

    const query = 'INSERT INTO book(ISBN, Author, Title, Year) VALUES (?, ?, ?, ?)';
    connection.query(query, [isbn, author, title, year], (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result);
    });
});

router.put('/update/:id', function(req, res, next) {
    var id = req.params.id;
    var isbn = req.body.isbn;
    var author = req.body.author;
    var title = req.body.title;
    var year = req.body.year;
    const query = 'UPDATE book SET ISBN = ?, Author = ?, Title = ?, Year = ? WHERE id = ' + id;
    connection.query(query, [isbn, author, title, year], (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result);
    });
});

router.delete('/delete/:id', function(req, res, next) {
    var id = req.params.id;
    console.log(req.params);
    const query = 'DELETE FROM test.book WHERE id = ?';
    connection.query(query, [id], (error, result, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
        
        res.send(result);
    });
});

module.exports = router;