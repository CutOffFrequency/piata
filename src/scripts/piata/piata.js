"use strict";
jQuery(($) => {
    const acctIn = $("#acctIn");
    const acctSub = $("#acctSub");
    const acctList = $("#acctList");
    const acctLoaded = $("#acctLoaded");
    // stores acct data as array of versions 
    var accts = [];
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
        let handled = {};
        handled.acct = data.acct;
        if (data.valid === true && data.info !== null) {
            // loop through acct array to see if acct is already loaded
            let checkList = listAccts();
            if ( checkList.includes(data.acct) ) {
                for (let acct of accts) {
                    if (acct[0].acct === data.acct) {
                        for (let version of acct) {
                            if ( isEqual(version, data) ) {
                                // handle reversion
                                handled.event = "match found"
                                pubsub.publish("_acct handled", handled);
                                return
                            }
                        }
                        acct.push(data);
                        handled.event = "new version";
                        pubsub.publish("_acct handled", handled);
                    }
                }
            } else {
                handled.event = "new account";
                pubsub.publish("_acct handled", handled);
            }
        }
        if (data.valid === false) {
            handled.event = "invalid";
            pubsub.publish("_acct handled", handled);
        }
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