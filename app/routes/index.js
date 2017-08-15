"use strict";

let express = require("express"),
    routes = require("./routes.js");

let routing = (req, res) => {
    let router = express.Router(),
        routeIndex = routes.findIndex(route => route.path === req.path);
    if (req.path === "favicon.ico") {
        res.status(200);
    }
    if (routeIndex >= 0) {
        res.status(200).render(routes[routeIndex].view, {
            title: routes[routeIndex].title
        });
    } else {
        console.log("404 from request: ", req.path);
        res.status(404).sendFile(process.cwd() + "/views/404.htm");
    }
    return router
};

module.exports = routing;