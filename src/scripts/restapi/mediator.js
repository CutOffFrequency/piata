/* global  Handlebars, pubsub, io, _ */

"use strict";
// does the heavy lifting for client <-> server communication
((global) => {
    const socket = io.connect("http://localhost:8000/piata");

    socket.on("connect", () => {
        socket.emit("initialize restapi");
    });
    socket.on("return restapi", (data) => {
        pubsub.publish("return restapi", data);
    })
})(window);