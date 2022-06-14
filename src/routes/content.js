var express = require("express");
var router = express.Router();
var connection = require("../database");

// CREATE TABLE `tbl_content` (
//   `idx` int NOT NULL AUTO_INCREMENT,
//   `media` varchar(45) DEFAULT NULL COMMENT '매체명',
//   `title` varchar(45) DEFAULT NULL COMMENT '콘텐츠 제목',
//   `views` int DEFAULT NULL COMMENT '조회수',
//   `is_use` char(1) DEFAULT NULL COMMENT '사용여부 => 0:사용, 1:미사용',
//   `content_number` varchar(150) DEFAULT NULL COMMENT '고유값',
//   `thumbnail` varchar(250) DEFAULT NULL COMMENT '썸네일',
//   `description` varchar(500) DEFAULT NULL COMMENT '본문내용',
//   `preview` varchar(250) DEFAULT NULL COMMENT '미리보기내용',
//   `writer` varchar(45) DEFAULT NULL COMMENT '글쓴이',
//   `category` varchar(45) DEFAULT NULL COMMENT '카테고리',
//   `tag` varchar(250) DEFAULT NULL COMMENT '테그',
//   `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
//   `created_by` int DEFAULT NULL,
//   `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
//   `updated_by` int DEFAULT NULL,
//   `deleted_at` datetime DEFAULT NULL,
//   `deleted_by` int DEFAULT NULL,
//   `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
//   PRIMARY KEY (`idx`),
//   KEY `created_by_idx` (`created_by`),
//   KEY `updated_by_idx` (`updated_by`),
//   KEY `deleted_by_idx` (`deleted_by`),
//   KEY `tbl_content_created_by_foreign` (`created_by`) /*!80000 INVISIBLE */,
//   KEY `tbl_content_deleted_by_foreign` (`updated_by`),
//   KEY `tbl_content_updated_by_foreign` (`deleted_by`),
//   CONSTRAINT `tbl_content_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `tbl_user` (`idx`) ON DELETE SET NULL,
//   CONSTRAINT `tbl_content_deleted_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `tbl_user` (`idx`) ON DELETE SET NULL,
//   CONSTRAINT `tbl_content_updated_by_foreign` FOREIGN KEY (`deleted_by`) REFERENCES `tbl_user` (`idx`) ON DELETE SET NULL
// ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='콘텐츠';

const table_name = "tbl_content";
const table_fields = [
  "media",
  "title",
  "views",
  "is_use",
  "content_number",
  "thumbnail",
  "description",
  "preview",
  "writer",
  "category",
  "tag",
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
    "SELECT idx as value, title as label FROM ?? WHERE is_deleted = 0";

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
  var field_names = "";
  var field_values;
  var field_value_list = [];

  if (Array.isArray(req.body)) {
    temp_all_field_values = [];
    temp_field_names = [];
    temp_field_values = [];

    req.body.map((item) => {
      temp_field_names = table_fields;
      temp_field_values = [];
      table_fields.map((x) => {
        if (item[x] != null) {
          temp_field_values.push("?");
          field_value_list.push(item[x]);
        } else {
          temp_field_names = temp_field_names.filter((item) => item != x);
        }
      });

      temp_all_field_values.push("(" + temp_field_values.join(", ") + ")");
    });

    field_values = temp_all_field_values.join(", ");
    field_names = temp_field_names.join(", ");
  } else {
    field_names = [];
    field_values = [];
    field_value_list = [];

    table_fields.map((x) => {
      if (req.body[x]) {
        field_values.push("?");
        field_value_list.push(req.body[x]);
      } else {
        field_names = field_names.filter((item) => item != x);
      }
    });
    field_values = "(" + field_values.join(", ") + ")";
    field_names.join(", ");
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
    where_array.push("idx = " + req.body.idx);
  }

  if (req.body.title) {
    where_array.push("title LIKE '%" + req.body.title + "%'");
  }

  if (req.body.category_id) {
    where_array.push("category = '" + req.body.category_id + "'");
  }

  if (req.body.s_date) {
    where_array.push("created_at >= '" + req.body.s_date + "'");
  }

  if (req.body.e_date) {
    where_array.push("created_at <= '" + req.body.e_date + "'");
  }

  if (req.body.is_use) {
    where_array.push("is_use = '" + req.body.is_use + "'");
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
    where_array.push("idx = " + req.body.idx);
  }

  if (req.body.title) {
    where_array.push("title LIKE '%" + req.body.title + "%'");
  }

  if (req.body.category_id) {
    where_array.push("category_id = '" + req.body.category_id + "'");
  }

  if (req.body.s_date) {
    where_array.push("created_at >= '" + req.body.s_date + "'");
  }

  if (req.body.e_date) {
    where_array.push("created_at <= '" + req.body.e_date + "'");
  }

  if (req.body.is_use) {
    where_array.push("is_use = '" + req.body.is_use + "'");
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
