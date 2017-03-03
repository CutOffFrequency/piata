"use strict";
jQuery(($) => {
    const acct_input = $("#acct-input");
    const acct_submit = $("#acct-submit");
    const acct_list = $("#acct-list");
    const acct_manage = $("#acct-manage");
    // store acct data as array of versions 
    let accts = [];
/*    let testAcct = [];
    testAcct.push({
        acct: 9987,
        data: null
    });
    accts.push(testAcct);
*/
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
        console.log(acct_list);
        return acct_list
    };
    // removes acct from accts
    let delAcct = (acct) => {
        // fix me
        /*accts = $.grep(accts, (value) => {
            return value != acct;
        });
        pubsub.publish("_acct handled", "delete", acct);
        pubsub.publish( "_updAccts", listAccts() );*/
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
    acct_list.on("click", "span", (e) => {
        let target = $(e.target);
        if ( target.hasClass("remove") ) {
            delAcct(e.target.id);
        }
    });
    // subscribes to pub sub for acct object
    pubsub.subscribe("return acct", handleAcct)
});