/* global  Handlebars, pubsub, io, _ */

"use strict";
// does the heavy lifting for client <-> server communication
((global) => {
    const socket = io.connect("http://localhost:8000/restapi");

    socket.on("connect", () => {
        console.log("connected to socket server");
    });

    let handleQuery = (topics, query) => {
        socket.emit("restapi request", query);
    };
    pubsub.subscribe("query requested", handleQuery);

    socket.on("restapi response", (data) => {
        console.log(data);
    })
})(window);