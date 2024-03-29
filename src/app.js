var logger = require("morgan");
var express = require("express");
var cookieParser = require("cookie-parser");

var fileRouter = require("./routes/file");
var brandRouter = require("./routes/brand");
var groupRouter = require("./routes/group");
var carKindRouter = require("./routes/carKind");
var modelRouter = require("./routes/model");
var galleryRouter = require("./routes/gallery");
var popularRouter = require("./routes/popular");
var modelLineupRouter = require("./routes/modelLineup");
var modelColorRouter = require("./routes/modelColor");
var modelTrimRouter = require("./routes/modelTrim");
var lineupRouter = require("./routes/lineup");
var trimRouter = require("./routes/trim");
var trimSpecificationRouter = require("./routes/trimSpecification");
var discountKindRouter = require("./routes/discountKind");
var discountConditionRouter = require("./routes/discountCondition");
var extraRouter = require("./routes/extra");
var quotationRouter = require("./routes/quotation");
var userRouter = require("./routes/user");
var userRoleRouter = require("./routes/userRole");
var countRouter = require("./routes/count");
var countSettingRouter = require("./routes/countSetting");
var contentRouter = require("./routes/content");
var recommendationRouter = require("./routes/recommendation");
var photoRouter = require("./routes/photo");
var rankRouter = require("./routes/rank");
var authRouter = require("./routes/auth");

var cors = require("cors");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({ origin: "*" }));

app.use("/file", fileRouter);
app.use("/brand", brandRouter);
app.use("/group", groupRouter);
app.use("/car-kind", carKindRouter);
app.use("/model", modelRouter);
app.use("/gallery", galleryRouter);
app.use("/popular", popularRouter);
app.use("/model-lineup", modelLineupRouter);
app.use("/model-color", modelColorRouter);
app.use("/model-trim", modelTrimRouter);
app.use("/lineup", lineupRouter);
app.use("/trim", trimRouter);
app.use("/trim-specification", trimSpecificationRouter);
app.use("/discount-kind", discountKindRouter);
app.use("/discount-condition", discountConditionRouter);
app.use("/extra", extraRouter);
app.use("/quotation", quotationRouter);
app.use("/count", countRouter);
app.use("/count-setting", countSettingRouter);
app.use("/user", userRouter);
app.use("/user-role", userRoleRouter);
app.use("/content", contentRouter);
app.use("/recommendation", recommendationRouter);
app.use("/photo", photoRouter);
app.use("/rank", rankRouter);
app.use("/auth", authRouter);

module.exports = app;
