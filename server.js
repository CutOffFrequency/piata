"use strict";

let express = require("express"),
    app = express();

const ssMain = require("./app");

app.set("port", process.env.PORT || 8000);
app.set("view engine", "ejs");

app.use(express.static(__dirname));

ssMain.ioServer(app).listen(app.get("port"), () => {
    console.log("listening to port 8k")
});

app.use("/", (req, res) => {
    ssMain.router(req, res);
});