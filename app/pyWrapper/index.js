"use strict";
const spawn = require("child_process").spawn;
const checkAcct = require("../pyWrapper/checke.js").check;
const _ = require("lodash");
// spawns child process to call python script
let callSpawn = (acct, io) => {
    io.of("/piata").emit("spawning");
    // inits arguments / options
    const loc = "e:\\scripts\\eriknowledgence";
    const command = "e:\\python27\\python";
    const script = "erik.py";
    const args = [ script, "-u", acct, "stream" ];
    const options = { stdio: "pipe", cwd: loc };
    let outJSON = "";
    let progressIncrement;
    let child = spawn(command, args, options,(err, stdout, stderr) => {
        progressIncrement = 10;
        if (err) {
            console.error(err);
        }
    });
    // chunks data returned from python script
    child.stdout.on("data", (chunk) => {
        if (chunk.toString() !== "success") {
            progressIncrement += 20;
            io.of("/piata").emit("appending", progressIncrement);
            outJSON += chunk;
        }
    });
    // returns data on close
    child.on("close", (code) => {
        let parsedJSON = _.attempt(JSON.parse.bind(null, outJSON));
        if ( parsedJSON instanceof Error ) {
            io.of("/piata").emit("JSON error", acct, outJSON);
        } else {
            if (code !== "0" ) {
                io.of("/piata").emit("return acct", parsedJSON);
                child.kill( "SIGHUP" );
            } else {
                let acctClose = {
                    acct: acct,
                    close: code
                };
                io.of("/piata").emit("spawn error", acctClose);
            }
        }
    });
};
// checks if acct number from input is valid
let validateAcct = (acct) => {
    return checkAcct(acct) ? true : false;
};
module.exports = {
    validateAcct,
    callSpawn
};