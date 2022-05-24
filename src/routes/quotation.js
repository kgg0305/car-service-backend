var express = require("express");
const excel = require("exceljs");
var router = express.Router();
var connection = require("../database");

//   CREATE TABLE `tbl_quotation` (
//     `idx` int(11) NOT NULL AUTO_INCREMENT,
//     `purchase_path` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `purchase_method` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `client_name` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `client_phone` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `brand_id` int(11) DEFAULT NULL,
//     `model_id` int(11) DEFAULT NULL,
//     `lineup_id` int(11) DEFAULT NULL,
//     `car_kind_id` int(11) DEFAULT NULL,
//     `trim_id` int(11) DEFAULT NULL,
//     `is_business` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `is_contract` char(1) DEFAULT NULL,
//     `contract_date` datetime DEFAULT NULL,
//     `is_release` char(1) DEFAULT NULL,
//     `release_date` datetime DEFAULT NULL,
//     `is_close` char(1) DEFAULT NULL,
//     `note` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     `assign_to` int(11) DEFAULT NULL,
//     `created_at` datetime DEFAULT NULL,
//     `created_by` int(11) DEFAULT NULL,
//     `updated_at` datetime DEFAULT NULL,
//     `updated_by` int(11) DEFAULT NULL,
//     `deleted_at` datetime DEFAULT NULL,
//     `deleted_by` int(11) DEFAULT NULL,
//     `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
//     PRIMARY KEY (`idx`)
//   ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

const table_name = "tbl_quotation";
const table_fields = [
  "purchase_path",
  "purchase_method",
  "client_name",
  "client_phone",
  "brand_id",
  "model_id",
  "lineup_id",
  "car_kind_id",
  "trim_id",
  "is_business",
  "is_contract",
  "contract_date",
  "is_release",
  "release_date",
  "is_close",
  "note",
  "assign_to",
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "deleted_at",
  "deleted_by",
  "is_deleted",
];

const brand_table_name = "tbl_brand";
const model_table_name = "tbl_model";
const lineup_table_name = "tbl_lineup";
const trim_table_name = "tbl_trim";
const car_kind_table_name = "tbl_car_kind";

router.get("/option-list", function (req, res, next) {
  const query =
    "SELECT idx as value, purchase_method as label FROM ?? WHERE is_deleted = 0";

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
  const query =
    "SELECT " +
    table_name +
    ".*, " +
    brand_table_name +
    ".brand_name, " +
    model_table_name +
    ".model_name, " +
    lineup_table_name +
    ".lineup_name, " +
    trim_table_name +
    ".trim_name, " +
    car_kind_table_name +
    ".kind_name " +
    "FROM " +
    table_name +
    " " +
    "LEFT JOIN " +
    brand_table_name +
    " ON " +
    table_name +
    ".brand_id = " +
    brand_table_name +
    ".idx " +
    "LEFT JOIN " +
    model_table_name +
    " ON " +
    table_name +
    ".model_id = " +
    model_table_name +
    ".idx " +
    "LEFT JOIN " +
    lineup_table_name +
    " ON " +
    table_name +
    ".lineup_id = " +
    lineup_table_name +
    ".idx " +
    "LEFT JOIN " +
    trim_table_name +
    " ON " +
    table_name +
    ".trim_id = " +
    trim_table_name +
    ".idx " +
    "LEFT JOIN " +
    car_kind_table_name +
    " ON " +
    table_name +
    ".car_kind_id = " +
    car_kind_table_name +
    ".idx " +
    "WHERE " +
    table_name +
    ".idx = ? LIMIT 0, 1";

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

  if (req.body.date_type) {
    switch (req.body.date_type) {
      case "0":
        if (req.body.s_date) {
          where_array.push(
            table_name + ".created_at >= '" + req.body.s_date + "'"
          );
        }

        if (req.body.e_date) {
          where_array.push(
            table_name + ".created_at <= '" + req.body.e_date + "'"
          );
        }
        break;

      case "1":
        if (req.body.s_date) {
          where_array.push(
            table_name + ".contract_date >= '" + req.body.s_date + "'"
          );
        }

        if (req.body.e_date) {
          where_array.push(
            table_name + ".contract_date <= '" + req.body.e_date + "'"
          );
        }
        break;

      case "2":
        if (req.body.s_date) {
          where_array.push(
            table_name + ".release_date >= '" + req.body.s_date + "'"
          );
        }

        if (req.body.e_date) {
          where_array.push(
            table_name + ".release_date <= '" + req.body.e_date + "'"
          );
        }
        break;

      default:
        break;
    }
  }

  if (req.body.purchase_method) {
    where_array.push(
      table_name + ".purchase_method = '" + req.body.purchase_method + "'"
    );
  }

  if (req.body.search_type) {
    switch (req.body.search_type) {
      case "0":
        if (req.body.search_text) {
          where_array.push(
            table_name + ".client_name = '" + req.body.search_text + "'"
          );
        }
        break;

      case "1":
        if (req.body.search_text) {
          where_array.push(
            table_name + ".client_phone = '" + req.body.search_text + "'"
          );
        }
        break;

      case "2":
        if (req.body.search_text) {
          where_array.push(
            car_kind_table_name + ".kind_name = '" + req.body.search_text + "'"
          );
        }
        break;

      default:
        break;
    }
  }

  if (req.body.purchase_path) {
    where_array.push("purchase_path = '" + req.body.purchase_path + "'");
  }

  const where_statement =
    where_array.length != 0 ? "AND " + where_array.join(" AND ") : "";

  const query =
    "SELECT " +
    table_name +
    ".*, " +
    brand_table_name +
    ".brand_name, " +
    model_table_name +
    ".model_name, " +
    lineup_table_name +
    ".lineup_name, " +
    car_kind_table_name +
    ".kind_name " +
    "FROM ?? " +
    "LEFT JOIN " +
    brand_table_name +
    " ON " +
    table_name +
    ".brand_id = " +
    brand_table_name +
    ".idx " +
    "LEFT JOIN " +
    model_table_name +
    " ON " +
    table_name +
    ".model_id = " +
    model_table_name +
    ".idx " +
    "LEFT JOIN " +
    lineup_table_name +
    " ON " +
    table_name +
    ".lineup_id = " +
    lineup_table_name +
    ".idx " +
    "LEFT JOIN " +
    car_kind_table_name +
    " ON " +
    table_name +
    ".car_kind_id = " +
    car_kind_table_name +
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

router.post("/count", function (req, res, next) {
  var where_array = [];

  if (req.body.assign_to) {
    where_array.push("assign_to = " + req.body.assign_to);
  }

  if (req.body.is_business) {
    where_array.push("is_business = '" + req.body.is_business + "'");
  }

  if (req.body.is_contract) {
    where_array.push("is_contract = '" + req.body.is_contract + "'");
  }

  if (req.body.is_release) {
    where_array.push("is_release = '" + req.body.is_release + "'");
  }

  if (req.body.is_close) {
    where_array.push("is_close = '" + req.body.is_close + "'");
  }

  const where_statement =
    where_array.length != 0 ? "AND " + where_array.join(" AND ") : "";

  const query =
    "SELECT COUNT(*) as count " +
    "FROM ?? " +
    "WHERE is_deleted = 0 " +
    where_statement;

  connection.query(query, table_name, (error, result, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    res.send(result ? result[0] : null);
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
    let work_sheet = work_book.addWorksheet("견적신청");
    work_sheet.columns = [
      { header: "ID", key: "idx", width: 15 },
      { header: "유입경로", key: "purchase_path", width: 15 },
      { header: "구입방법", key: "purchase_method", width: 15 },
      { header: "이름", key: "client_name", width: 15 },
      { header: "연락처", key: "client_phone", width: 15 },
      { header: "브랜드", key: "brand_id", width: 15 },
      { header: "차종", key: "car_kind_id", width: 15 },
      { header: "지점", key: "assign_to", width: 15 },
      { header: "인원", key: "assign_to", width: 15 },
    ];
    work_sheet.addRows(result);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "quotation.xlsx"
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
