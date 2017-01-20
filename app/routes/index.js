"use strict";

let express = require("express");

let routing = (req, res) => {
    let router = express.Router(),
    // "meta-data" for routes
        routes = [{
            path: "/",
            title: "ssMain",
            view: "home"
        }, {
            path: "/piata",
            title: "Pi ataGlance",
            view: "piata"
        }];
    // iterates through routes looking for req.path
    for ( let route of routes ) {
        // serves req.path if found
        if ( req.path === route.path) {
            res.status(200).render(route.view, {
                title: route.title
            });
        // else 404s
        } else {
            console.log("404 from request: ", req.path);
            res.status(404).sendFile(process.cwd() + "/views/404.htm");
        }
    }
    return router
};

module.exports = routing;