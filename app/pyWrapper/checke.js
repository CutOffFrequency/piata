"use strict";
const fs = require("fs");
const _ = require("lodash");

let lookUp = ( acct )  => {
    const ordentry = "e:\\ordentry\\";
    // if acct number is in range, check e:
    if ( acct % 1 === 0 && acct > 0 && acct < 10000 ) {
        let target = _.attempt( (path) => {
            return fs.statSync(path);
        }, ordentry + acct.toString().trim() );
        if ( target instanceof Error ) { 
            console.log("error from lookUp", target);
            return false
        }
        if ( target.isDirectory() ) {
            return true
        } else {
            console.log("lookUp target is not a directory");
            return false
        }
    } else {
        console.log("lookUp target is out of range");
        return false
    }
};

let list = () => {
    let accts = [];
    console.log("accts list loading please wait");
    for ( var i = 1; i < 10000; i += 1 ) {
        if ( lookUp(i) ) {
            accts.push(i);
        }
    }
    return accts;
};

let check = (acct) => {
    let look = lookUp(acct);
    console.log("checke result for acct ", acct, ": ", look);
    return look;
};

module.exports = {
    list,
    check
};