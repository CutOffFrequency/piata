"use strict";
jQuery(($) => {
    const acctIn = $("#acctIn");
    const acctSub = $("#acctSub");
    const acctList = $("#acctList");
    const acctLoaded = $("#acctLoaded");
    // store acct data as array of versions 
    let accts = [];
    // returns array of account numbers for consumption
    let listAccts = () => {
        var acctList = [];
        for (let acct of accts) {
            acctList.push(acct[0].acct);
        }
        return acctList
    };
    // removes acct from accts
    let delAcct = (acct) => {
        accts = $.grep(accts, (value) => {
            return value != acct;
        });
        pubsub.publish("_acct handled", "delete", acct);
        pubsub.publish( "_updAccts", listAccts() );
    };
    // manages acct array after loading data
    let handleAcct = (topics, data) => {
        let stats = {};
        stats.acct = data.acct;
        if (data.valid && data.info !== null) {
            // loop through acct array to see if acct is already loaded
            let checkList = listAccts();
            if ( checkList.includes(data.acct) ) {
                for (let acct of accts) {
                    if (acct[0].acct === data.acct) {
                        for (let version of acct) {
                            // handle if a matching version is already loaded
                            if ( isEqual(version, data) ) {
                                stats.event = "match found"
                                return
                            }
                        }
                        // add new version if acct is already loaded
                        acct.push(data);
                        stats.event = "new version";
                    }
                }
            } else {
                // add a new account if not already loaded
                accts.push(data);
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
    acctSub.on("click", () => {
        // begins account verification and load requests
        pubsub.publish( "load acct", acctIn.val() );
    });
    // acct loaded button event handler
    acctLoaded.on("click", () => {
        pubsub.publish( "_updAccts", listAccts() )
    });
    // acct deletion event listener on acctList
    acctList.on("click", "span", (e) => {
        let target = $(e.target);
        if ( target.hasClass("remove") ) {
            delAcct(e.target.id);
        }
    });
    // subscribes to pub sub for acct object
    pubsub.subscribe("return acct", handleAcct)
});