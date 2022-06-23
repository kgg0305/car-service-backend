var express = require("express");
var router = express.Router();
var connection = require("../database");

// CREATE TABLE `tbl_discount_condition` (
//     `idx` int(11) NOT NULL AUTO_INCREMENT,
//     `discount_kind_id` int(11) DEFAULT NULL COMMENT '할인종류 아아디',
//     `condition_name` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '할인 조건 명',
//     `discount_price` int(11) DEFAULT NULL COMMENT '가격',
//     `price_unit` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '가격단위',
//     `created_at` datetime DEFAULT NULL,
//     `created_by` int(11) DEFAULT NULL,
//     `updated_at` datetime DEFAULT NULL,
//     `updated_by` int(11) DEFAULT NULL,
//     `deleted_at` datetime DEFAULT NULL,
//     `deleted_by` int(11) DEFAULT NULL,
//     `is_deleted` tinyint(1) DEFAULT NULL,
//     PRIMARY KEY (`idx`)
//   ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

const table_name = "tbl_discount_condition";
const table_fields = [
  "discount_kind_id",
  "condition_name",
  "discount_price",
  "price_unit",
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "deleted_at",
  "deleted_by",
  "is_deleted",
];

const brand_table_name = "tbl_brand";
const discount_kind_table_name = "tbl_discount_kind";

router.get("/option-list", function (req, res, next) {
  const query =
    "SELECT idx as value, kind_name as label FROM ?? WHERE is_deleted = 0";

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

router.post("/list-all", function (req, res, next) {
  var where_array = [];

  if (req.body.discount_kind_id) {
    where_array.push("discount_kind_id = " + req.body.discount_kind_id);
  }

  const where_statement =
    where_array.length != 0 ? "AND " + where_array.join(" AND ") : "";

  const query = "SELECT * FROM ?? WHERE is_deleted = 0 " + where_statement;

  connection.query(query, table_name, (error, result, fields) => {
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

  if (req.body.brand_id) {
    where_array.push(
      discount_kind_table_name + ".brand_id = " + req.body.brand_id
    );
  }

  if (req.body.discount_kind_id) {
    where_array.push(
      table_name + ".discount_kind_id = " + req.body.discount_kind_id
    );
  }

  if (req.body.s_date) {
    where_array.push(
      discount_kind_table_name + ".s_date >= '" + req.body.s_date + "'"
    );
  }

  if (req.body.e_date) {
    where_array.push(
      discount_kind_table_name + ".e_date <= '" + req.body.e_date + "'"
    );
  }

  const where_statement =
    where_array.length != 0 ? "AND " + where_array.join(" AND ") : "";

  const query =
    "SELECT " +
    table_name +
    ".*, " +
    brand_table_name +
    ".brand_name, " +
    discount_kind_table_name +
    ".kind_name, " +
    discount_kind_table_name +
    ".s_date, " +
    discount_kind_table_name +
    ".e_date FROM ?? " +
    "LEFT JOIN " +
    discount_kind_table_name +
    " ON " +
    table_name +
    ".discount_kind_id = " +
    discount_kind_table_name +
    ".idx " +
    "LEFT JOIN " +
    brand_table_name +
    " ON " +
    discount_kind_table_name +
    ".brand_id = " +
    brand_table_name +
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

router.post("/count", function (req, res, next) {
  var where_array = [];

  if (req.body.brand_id) {
    where_array.push(
      discount_kind_table_name + ".brand_id = " + req.body.brand_id
    );
  }

  if (req.body.discount_kind_id) {
    where_array.push(
      table_name + ".discount_kind_id = " + req.body.discount_kind_id
    );
  }

  if (req.body.s_date) {
    where_array.push(
      discount_kind_table_name + ".s_date >= '" + req.body.s_date + "'"
    );
  }

  if (req.body.e_date) {
    where_array.push(
      discount_kind_table_name + ".e_date <= '" + req.body.e_date + "'"
    );
  }

  const where_statement =
    where_array.length != 0 ? "AND " + where_array.join(" AND ") : "";

  const query =
    "SELECT COUNT(*) as count FROM ?? " +
    "LEFT JOIN " +
    discount_kind_table_name +
    " ON " +
    table_name +
    ".discount_kind_id = " +
    discount_kind_table_name +
    ".idx " +
    "LEFT JOIN " +
    brand_table_name +
    " ON " +
    discount_kind_table_name +
    ".brand_id = " +
    brand_table_name +
    ".idx " +
    "WHERE " +
    table_name +
    ".is_deleted = 0 " +
    where_statement;

  connection.query(query, table_name, (error, result, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    res.send(result[0]);
  });
});

router.post("/list-id", function (req, res, next) {
  var where_array = [];

  if (req.body.discount_kind_id) {
    where_array.push(
      table_name + ".discount_kind_id = " + req.body.discount_kind_id
    );
  }

  const where_statement =
    where_array.length != 0 ? "AND " + where_array.join(" AND ") : "";

  const query =
    "SELECT " +
    table_name +
    ".idx " +
    "FROM ?? " +
    "WHERE " +
    table_name +
    ".is_deleted = 0 " +
    where_statement;

  connection.query(query, table_name, (error, result, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    res.send(result);
  });
});

router.post("/check-name", function (req, res, next) {
  const condition_name = req.body.condition_name;
  const where_statement = "condition_name = ?";
  const query =
    "SELECT COUNT(*) as count FROM " + table_name + " WHERE " + where_statement;

  connection.query(query, [condition_name], (error, result, fields) => {
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
