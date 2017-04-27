"use strict";

module.exports = (io, app) => {
    const wrapper = require("../pyWrapper");
    const apis = require("../../global.js").apis;
    // socket transactions for piata
    io.of("/piata").on("connection", socket => {
        // asset for acct data management
        console.log("client connected to /piata.io")
        socket.on("validate", (acct) => {
            console.log("passing validation request for acct: ", acct);
            if ( wrapper.validateAcct(acct) ) {
                wrapper.callSpawn(acct, io);
            } else {
                socket.emit("validate fail", acct);
            }
        });
    })
    // socket transactions for restapi
    io.of("/restapi").on("connection", socket => {
        socket.on("initialize restapi", () => {
            socket.emit("return restapi", apis.restapi);
        });
    })
}