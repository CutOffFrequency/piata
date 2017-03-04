"use strict";
jQuery(($) => {
    const acct_input = $("#acct-input");
    const acct_submit = $("#acct-submit");
    const acct_list = $("#acct-list");
    const acct_manage = $("#acct-manage");
    // store acct data as array of versions
    // ex: [accts[acct1{v1},{v2}],[acct2{v1}]]
    let accts = [];
    // returns array of account numbers for consumption
    let listAccts = (deep) => {
        console.log("list accounts - deep : ", deep);
        var acct_list = [];
        if (accts) {
            if (deep) {
                for (let acct of accts ) {
                    let listing = {};
                    listing.acct = acct[0].acct;
                    listing.versions = acct.length
                    acct_list.push(listing);
                }
            } else {
                for (let acct of accts) {
                    acct_list.push(acct[0].acct);
                }
            }
        }
        console.log("listing: ", acct_list);
        return acct_list
    };
    // removes acct from accts
    let delAcct = (acct, remAcct, version) => {
        console.log("delAcct invoked...", acct, remAcct, version);
        let errorize = (err) => {
            console.log("error from delAcct: ", err);
        }
        let event,
            response = {};
        response.acct = acct;
        response.version = version;
        let deleteAccount = (a, v) => {
            console.log("delete Account invoked!");
            if (remAcct) {
                console.log("deleting a: ", a);
                event = "delete account";
                accts.splice(a, 1);
            } 
            if (version) {
                console.log("deleting a: ", a, " v: ", v);
                event = "delete version";
                accts[a].splice(v, 1);
            }
            pubsub.publish(event, response);
            pubsub.publish( "_updAccts", listAccts(true) );
            return
        }
        if (acct) {
            for (let i = 0; i < accts.length; i++ ) {
                if (accts[i][0].acct == acct ) {
                    if (remAcct) {
                        console.log("remAcct - deleteAccount invoked?");
                        deleteAccount(i);
                    }
                    if (version) {
                        console.log("!remAcct - deleteAccount invoked?");
                        deleteAccount(i, version - 1);
                    } else {
                        errorize("no target");
                    }
                }
            }
        } else {
            errorize("no acct");
        }
    };
    // manages acct array after loading data
    let handleAcct = (topics, data) => {
        let stats = {};
        stats.acct = data.acct;
        if (data.valid && data.info !== null) {
            // loops through acct array to see if acct is already loaded
            let checkList = listAccts(false);
            console.log(checkList);
            if ( checkList.includes(data.acct) ) {
                for (let acct of accts) {
                    if (acct[0].acct === data.acct) {
                        for (let version of acct) {
                            // handles if matching version loaded
                            if ( _.isEqual(version, data) ) {
                                stats.event = "match found"
                                pubsub.publish("_acct handled", stats);
                                return
                            }
                        }
                        // adds new version if acct is already loaded
                        acct.push(data);
                        stats.event = "new version";
                    }
                }
            } else {
                // add a new account if not already loaded
                let newAcct = [];
                newAcct.push(data)
                accts.push(newAcct);
                stats.event = "new account";
            }
        } else {
            stats.event = "null data";
        }
        if (!data.valid) {
            stats.event = "invalid";
        }
        pubsub.publish("_acct handled", stats);
    };
    // acct submit button event handler
    acct_submit.on("click", () => {
        // begins account verification and load requests
        pubsub.publish( "load acct", acct_input.val() );
        acct_input.val("");
    });
    // acct loaded button event handler
    acct_manage.on("click", () => {
        pubsub.publish( "_updAccts", listAccts(true) );
    });
    // acct deletion event listener on acctList
    // invoke delAcct(acct, remAcct, version)
    acct_list.on("click", (e) => {
        let target = $(e.target),
            substr = e.target.id.substring(6),
            vIndex = substr.indexOf("v_"),
            tAcct = substr.substring(0, vIndex),
            tVersion = substr.substring(vIndex + 2);
        if ( target.hasClass("remove_acct") ) {
            // delete acct
            // console.log("acct: ", substr, " len: ", substr.length ) ;
            delAcct(substr, true, null);
        }
        if ( target.hasClass("remove_version") ) {
            // remove version
            // console.log("acct: ", tAcct, " len: ", tAcct.length);
            // console.log("version: ", tVersion, " len: ", tVersion.length );
            delAcct(tAcct, false, tVersion);
        }
    });
    // subscribes to pub sub for acct object
    pubsub.subscribe("return acct", handleAcct)
});