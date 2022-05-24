var express = require("express");
const excel = require("exceljs");
var router = express.Router();
var connection = require("../database");

// CREATE TABLE `tbl_extra` (
//     `idx` int(11) NOT NULL AUTO_INCREMENT,
//     `brand_id` int(11) DEFAULT NULL,
//     `group_id` int(11) DEFAULT NULL,
//     `model_id` int(11) DEFAULT NULL,
//     `region` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `condition` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `fee` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `discount` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `transfer` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `created_at` datetime DEFAULT NULL,
//     `created_by` int(11) DEFAULT NULL,
//     `updated_at` datetime DEFAULT NULL,
//     `updated_by` int(11) DEFAULT NULL,
//     `deleted_at` datetime DEFAULT NULL,
//     `deleted_by` int(11) DEFAULT NULL,
//     `is_deleted` tinyint(1) DEFAULT NULL,
//     PRIMARY KEY (`idx`)
//   ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

const table_name = "tbl_extra";
const table_fields = [
  "brand_id",
  "group_id",
  "model_id",
  "region",
  "condition",
  "fee",
  "discount",
  "transfer",
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "deleted_at",
  "deleted_by",
  "is_deleted",
];

const brand_table_name = "tbl_brand";
const group_table_name = "tbl_group";
const model_table_name = "tbl_model";

router.get("/option-list", function (req, res, next) {
  const query =
    "SELECT idx as value, region as label FROM ?? WHERE is_deleted = 0";

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

  if (req.body.brand_id) {
    where_array.push(table_name + ".brand_id = " + req.body.brand_id);
  }

  if (req.body.group_id) {
    where_array.push(table_name + ".group_id = " + req.body.group_id);
  }

  if (req.body.model_id) {
    where_array.push(table_name + ".model_id = " + req.body.model_id);
  }

  const where_statement =
    where_array.length != 0 ? "AND " + where_array.join(" AND ") : "";

  const query =
    "SELECT " +
    table_name +
    ".*, " +
    brand_table_name +
    ".brand_name, " +
    group_table_name +
    ".group_name, " +
    model_table_name +
    ".model_name " +
    "FROM ?? " +
    "LEFT JOIN " +
    brand_table_name +
    " ON " +
    table_name +
    ".brand_id = " +
    brand_table_name +
    ".idx " +
    "LEFT JOIN " +
    group_table_name +
    " ON " +
    table_name +
    ".group_id = " +
    group_table_name +
    ".idx " +
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
  const region = req.body.region;
  const where_statement = "region = ?";
  const query =
    "SELECT COUNT(*) as count FROM " + table_name + " WHERE " + where_statement;

  connection.query(query, [region], (error, result, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    res.send(result[0].count == 0 ? { exist: false } : { exist: true });
  });
});

router.post("/download", function (req, res, next) {
  const query = "SELECT * FROM ??";

  connection.query(query, table_name, (error, result, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    let work_book = new excel.Workbook();
    let work_sheet = work_book.addWorksheet("취득세");
    work_sheet.columns = [
      { header: "ID", key: "idx", width: 15 },
      { header: "모델ID", key: "brand_id", width: 15 },
      { header: "배기량", key: "condition", width: 15 },
      { header: "등록지역", key: "region", width: 15 },
      { header: "취득세", key: "fee", width: 15 },
      { header: "채권할인", key: "discount", width: 15 },
      { header: "탁송", key: "transfer", width: 15 },
    ];
    work_sheet.addRows(result);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "extra.xlsx"
    );

    work_book.xlsx.write(res).then(function () {
      res.send();
    });
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
