var express = require("express");
var router = express.Router();
var connection = require("../database");

// CREATE TABLE `tbl_gallery` (
//   `idx` int(11) NOT NULL AUTO_INCREMENT,
//   `brand_id` int(11) DEFAULT NULL,
//   `group_id` int(11) DEFAULT NULL,
//   `model_id` int(11) DEFAULT NULL COMMENT '모델아이디',
//   `picture_index` int(11) DEFAULT NULL COMMENT '사진',
//   `created_at` datetime DEFAULT NULL,
//   `created_by` int(11) DEFAULT NULL,
//   `updated_at` datetime DEFAULT NULL,
//   `updated_by` int(11) DEFAULT NULL,
//   `deleted_at` datetime DEFAULT NULL,
//   `deleted_by` int(11) DEFAULT NULL,
//   `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
//   PRIMARY KEY (`idx`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

const table_name = "tbl_gallery";
const table_fields = [
  "brand_id",
  "group_id",
  "model_id",
  "picture_index",
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "deleted_at",
  "deleted_by",
  "is_deleted",
];

const model_table_name = "tbl_model";

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

router.post("/list/:offset?", function (req, res, next) {
  const offset = req.params.offset ? req.params.offset : 0;

  var where_array = [];

  if (req.body.model_id) {
    where_array.push(table_name + ".model_id = " + req.body.model_id);
  }

  const where_statement =
    where_array.length != 0 ? "AND " + where_array.join(" AND ") : "";

  const query =
    "SELECT " +
    table_name +
    ".*, " +
    model_table_name +
    ".model_name, " +
    model_table_name +
    ".picture_1, " +
    model_table_name +
    ".picture_2, " +
    model_table_name +
    ".picture_3, " +
    model_table_name +
    ".picture_4, " +
    model_table_name +
    ".picture_5, " +
    model_table_name +
    ".picture_6, " +
    model_table_name +
    ".picture_7, " +
    model_table_name +
    ".picture_8 " +
    "FROM ?? " +
    "LEFT JOIN " +
    model_table_name +
    " ON " +
    table_name +
    ".model_id = " +
    model_table_name +
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