"use strict";

let express = require("express");

let routing = (req, res) => {
    let router = express.Router(),
        routes = [{
            path: "/",
            view: "home",
            title: "ssMain"
        }, {
            path: "/piata",
            view: "piata",
            title: "Pi ataGlance"
        }];
    let routeIndex = routes.findIndex(route => route.path === req.path);
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