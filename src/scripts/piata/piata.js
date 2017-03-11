"use strict";
jQuery(($) => {
    const acct_input = $("#acct-input");
    const acct_submit = $("#acct-submit");
    const acct_list = $("#acct-list");
    const acct_manage = $("#acct-manage");
    let accts = [];
    // returns array of account numbers for consumption
    let listAccts = (deep, acctsToggled) => {
        console.log("list accounts - deep : ", deep);
        var acct_list = [];
        if (accts) {
            if (deep) {
                for (let acct of accts ) {
                    let vIndex, listing = {};
                    let account = acct[0].acct;
                    listing.acct = account;
                    listing.versions = [];
                    if ( acct.length > 1) {
                        for (let i = 0; i < acct.length; i++) {
                            let v = {};
                            v.vIndex = i + 1;
                            v.rem_v_id = "rem_a_" + account + "v_" + vIndex;
                            listing.versions.push(v);
                        }
                    }
                    acct_list.push(listing);
                }
            } else {
                for (let acct of accts) {
                    acct_list.push(acct[0].acct);
                }
            }
        }
        if (acctsToggled) {
            pubsub.publish("return shallow accts", acct_list)
        } else {
            return acct_list
        }
    };
    // listAccts() curried for shallow accts list requests
    let shallowAccts = topics => listAccts(false, true);
    // subscribes to shallow accounts list requests
    pubsub.subscribe("req shallow accts", shallowAccts);
    // removes acct from accts
    let delAcct = (acct, remAcct, version) => {
        let errorize = (err) => {
            console.log("error from delAcct: ", err);
        }
        let event,
            response = {};
        response.acct = acct;
        let deleteAccount = (a, v) => {
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
            response.event = event;
            pubsub.publish("_acct handled", response);
            pubsub.publish( "_updAccts", listAccts(true) );
            return
        }
        if (acct) {
            for (let i = 0; i < accts.length; i++ ) {
                if (accts[i][0].acct == acct ) {
                    if (remAcct) {
                        deleteAccount(i);
                        return
                    }
                    if (version) {
                        deleteAccount(i, version - 1);
                        return
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
        let stats = { acct: data.acct };
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
    acct_list.on("click", (e) => {
        let target = $(e.target),
            substr = e.target.id.substring(6),
            vIndex = substr.indexOf("v_"),
            tAcct = substr.substring(0, vIndex),
            tVersion = substr.substring(vIndex + 2);
        if ( target.hasClass("remove_acct") ) {
            // remove acct from accts
            delAcct(substr, true, null);
        }
        if ( target.hasClass("remove_version") ) {
            // remove version from accts
            delAcct(tAcct, false, tVersion);
        }
    });
    // subscribes for new acct object to handle
    pubsub.subscribe("return acct", handleAcct)
});