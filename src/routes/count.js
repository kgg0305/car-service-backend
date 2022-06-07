var express = require("express");
var router = express.Router();
var connection = require("../database");

// CREATE TABLE `tbl_count` (
//     `idx` int(11) NOT NULL AUTO_INCREMENT,
//     `rent_request` int(11) DEFAULT NULL,
//     `rent_admin` int(11) DEFAULT NULL,
//     `new_request` int(11) DEFAULT NULL,
//     `new_admin` int(11) DEFAULT NULL,
//     `created_at` datetime DEFAULT NULL,
//     `created_by` int(11) DEFAULT NULL,
//     `updated_at` datetime DEFAULT NULL,
//     `updated_by` int(11) DEFAULT NULL,
//     `deleted_at` datetime DEFAULT NULL,
//     `deleted_by` int(11) DEFAULT NULL,
//     `is_deleted` tinyint(1) DEFAULT NULL,
//     PRIMARY KEY (`idx`)
//   ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

const table_name = "tbl_count";
const table_fields = [
  "rent_request",
  "rent_admin",
  "new_request",
  "new_admin",
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "deleted_at",
  "deleted_by",
  "is_deleted",
];

router.get("/option-list", function (req, res, next) {
  const query =
    "SELECT idx as value, brand_name as label FROM ?? WHERE is_deleted = 0";

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

router.get("/info-by-date/:date", function (req, res, next) {
  const date = req.params.date;
  const query =
    "SELECT * FROM " +
    table_name +
    " WHERE CAST(created_at AS DATE) = ? LIMIT 0, 1";

  connection.query(query, [date], (error, result, fields) => {
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

  if (req.body.idx) {
    where_array.push('idx = "' + req.body.idx + '"');
  }

  if (req.body.is_use) {
    where_array.push("is_use = " + req.body.is_use);
  }

  if (req.body.year) {
    where_array.push("YEAR(created_at) = " + req.body.year);
  }

  if (req.body.month) {
    where_array.push("MONTH(created_at) = " + req.body.month);
  }

  const where_statement =
    where_array.length != 0 ? "AND " + where_array.join(" AND ") : "";

  const query =
    "SELECT * FROM ?? WHERE is_deleted = 0 " +
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

router.post("/count", function (req, res, next) {
  var where_array = [];

  if (req.body.idx) {
    where_array.push('idx = "' + req.body.idx + '"');
  }

  if (req.body.is_use) {
    where_array.push("is_use = " + req.body.is_use);
  }

  if (req.body.year) {
    where_array.push("YEAR(created_at) = " + req.body.year);
  }

  if (req.body.month) {
    where_array.push("MONTH(created_at) = " + req.body.month);
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

router.post("/check-name", function (req, res, next) {
  const brand_name = req.body.brand_name;
  const where_statement = "brand_name = ?";
  const query =
    "SELECT COUNT(*) as count FROM " + table_name + " WHERE " + where_statement;

  connection.query(query, [brand_name], (error, result, fields) => {
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
