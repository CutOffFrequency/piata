"use strict";

const request = require("request");

const wrapper = require("../pyWrapper");
const globals = require("../../global.js");

const apis = globals.apis;
const creds = globals.creds;

module.exports = (io, app) => {
    // socket transactions for piata
    io.of("/piata").on("connection", socket => {
        console.log("client connected to /piata.io");
        socket.on("validate", (acct) => {
            if ( wrapper.validateAcct(acct) ) {
                wrapper.callSpawn(acct, io);
            } else {
                socket.emit("validate fail", acct);
            }
        });
    });
    // socket transactions for restapi
    io.of("/restapi").on("connection", socket => {
        console.log("client connected to /restapi.io");
        socket.on("restapi request", restReq => {
            let url = apis.pirest,
                user = creds.username,
                pass = creds.password,
                auth = "Basic " + new Buffer(`${user}:${pass}`).toString("base64");
            request(
                {
                    url: url + restReq,
                    headers: {
                        "authorization" : auth
                    }
                }, (err, response, body) => {
                    if (err) {
                        console.log("error: ", err);
                    }
                    let data = {}
                    let first = restReq.search("/") + 1;
                    let second = restReq.search("out=json") - 2;
                    let acct = restReq.slice(0, first - 1);
                    data.acct = acct;
                    let table = restReq.slice(first, second);
                    data.table = table;
                    data.body = body;
                    socket.emit("restapi response", data);
                }
            );
        });
    });
};