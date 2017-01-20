"use strict";
module.exports = (io, app) => {
    // socket transactions for piata
    io.of("/piata").on("connection", socket => {
        // asset for acct data management
        let wrapper = require("../pyWrapper");
        console.log("client connected to /piata.io")
        socket.on("validate", (acct) => {
            console.log("passing validation request for acct: ", acct);
            if ( wrapper.validateAcct(acct) ) {
                wrapper.callSpawn(acct, io);
            }
        });
    })
}