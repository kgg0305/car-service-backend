var express = require("express");
var router = express.Router();
var connection = require("../database");

// CREATE TABLE `tbl_trim_specification` (
//     `idx` int(11) NOT NULL AUTO_INCREMENT,
//     `trim_id` int(11) DEFAULT NULL COMMENT '트림아이디',
//     `specification_id` char(1) DEFAULT NULL COMMENT '사양',
//     `detail` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '세부내용',
//     `created_at` datetime DEFAULT NULL,
//     `created_by` int(11) DEFAULT NULL,
//     `updated_at` datetime DEFAULT NULL,
//     `updated_by` int(11) DEFAULT NULL,
//     `deleted_at` datetime DEFAULT NULL,
//     `deleted_by` int(11) DEFAULT NULL,
//     `is_deleted` tinyint(1) DEFAULT NULL,
//     PRIMARY KEY (`idx`)
//   ) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;

// 테이블명
const table_name = "tbl_trim_specification";

// 테이블항목
const table_fields = [
  "trim_id",
  "specification_id",
  "detail",
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "deleted_at",
  "deleted_by",
  "is_deleted",
];

const trim_table_name = "tbl_trim";

// 옵션목록 얻기
router.get("/option-list", function (req, res, next) {
  const query =
    "SELECT idx as value, model_name as label FROM ?? WHERE is_deleted = 0";

  connection.query(query, table_name, (error, result, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    res.send(result);
  });
});

//아이디에 따르는 개별데이터 얻기
router.get("/:idx", function (req, res, next) {
  const idx = req.params.idx;
  const query = "SELECT * FROM " + table_name + " WHERE idx = ? LIMIT 0, 1";

  connection.query(query, [idx], (error, result, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    res.send(result ? result[0] : null);
  });
});

// 데이터목록 등록
router.post("/", function (req, res, next) {
  var field_names = table_fields.join(", ");
  var field_values;
  var field_value_list = [];

  if (Array.isArray(req.body)) {
    temp_field_values = [];
    req.body.map((item) => {
      temp_field_values.push(
        "(" + table_fields.map((x) => "?").join(", ") + ")"
      );
      field_value_list = [
        ...field_value_list,
        ...table_fields.map((x) => item[x]),
      ];
    });

    field_values = temp_field_values.join(", ");
  } else {
    field_values = "(" + table_fields.map((x) => "?").join(", ") + ")";
    field_value_list = table_fields.map((x) => req.body[x]);
  }

  const query =
    "INSERT INTO " +
    table_name +
    "(" +
    field_names +
    ") VALUES " +
    field_values;
  connection.query(query, field_value_list, (error, result, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    res.send(result);
  });
});

// 검색어에 해당한 데이터목록 얻기
router.post("/list/:offset?", function (req, res, next) {
  const offset = req.params.offset ? req.params.offset : 0;

  var where_array = [];

  if (req.body.trim_id) {
    where_array.push(table_name + ".trim_id = " + req.body.trim_id);
  }

  const where_statement =
    where_array.length != 0 ? "AND " + where_array.join(" AND ") : "";

  const query =
    "SELECT " +
    table_name +
    ".*, " +
    trim_table_name +
    ".trim_name " +
    "FROM ?? " +
    "LEFT JOIN " +
    trim_table_name +
    " ON " +
    table_name +
    ".trim_id = " +
    trim_table_name +
    ".idx " +
    "WHERE " +
    table_name +
    ".is_deleted = 0 " +
    where_statement +
    " LIMIT " +
    offset +
    ", 10";

  connection.query(query, table_name, (error, result, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    res.send(result);
  });
});

// 검색어에 해당한 데이터목록개수 얻기
router.post("/count", function (req, res, next) {
  var where_array = [];

  if (req.body.trim_id) {
    where_array.push(table_name + ".trim_id = " + req.body.trim_id);
  }

  const where_statement =
    where_array.length != 0 ? "AND " + where_array.join(" AND ") : "";

  const query =
    "SELECT COUNT(*) as count FROM ?? WHERE is_deleted = 0 " + where_statement;

  connection.query(query, table_name, (error, result, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    res.send(result[0]);
  });
});

// 증복명 검사
router.post("/check-name", function (req, res, next) {
  const model_name = req.body.model_name;
  const where_statement = "model_name = ?";
  const query =
    "SELECT COUNT(*) as count FROM " + table_name + " WHERE " + where_statement;

  connection.query(query, [model_name], (error, result, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    res.send(result[0].count == 0 ? { exist: false } : { exist: true });
  });
});

// 개별데이터 수정
router.put("/:idx", function (req, res, next) {
  var idx = req.params.idx;
  const field_names = table_fields.map((x) => x + " = ?").join(", ");
  const field_value_list = table_fields.map((x) => req.body[x]);

  const query =
    "UPDATE " + table_name + " SET " + field_names + " WHERE idx = " + idx;
  connection.query(query, field_value_list, (error, result, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    res.send(result);
  });
});

// 아이디에 따르는 데이터삭제
router.delete("/:idx", function (req, res, next) {
  var idx = req.params.idx;
  const query = "DELETE FROM " + table_name + " WHERE idx = ?";
  connection.query(query, [idx], (error, result, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    res.send(result.affectedRows ? true : false);
  });
});

module.exports = router;
