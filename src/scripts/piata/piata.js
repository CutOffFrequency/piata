"use strict";
jQuery(($) => {
    const acct_input = $("#acct-input");
    const acct_submit = $("#acct-submit");
    const acct_list = $("#acct-list");
    const acct_manage = $("#acct-manage");
    const allProps = [ "taction", "sched", "remind", "acct", "autoa",
        "autob", "contacts", "disp_proc", "disp_steps", "disp_cond",
        "sched_cond", "dcl", "help", "form","picks", "skips", "vars" ]
    let accts = [];
    // returns array of account numbers for consumption
    let listAccts = (deep, acctsToggled) => {
        var acct_list = [];
        if (accts) {
            if (deep) {
                for (let acct of accts ) {
                    let vIndex, listing = {};
                    let account = acct[0].acct;
                    listing.acct = account;
                    listing.versions = [];
                    if (acct.length > 1) {
                        for (let i = 0; i < acct.length; i += 1) {
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
            pubsub.publish("return accts for select", acct_list)
            return
        } else {
            return acct_list
        }
    };
    // listAccts() curried for populating acct select
    let selectAccts = topics => listAccts(false, true);
    // subscribes to shallow accounts list requests
    pubsub.subscribe("req accts for select", selectAccts);
    let checkAcctsLen = () => {
        let disable,
            len = listAccts(false, false).length;
        disable = len > 0 ? false : true;
        pubsub.publish("return accts check", disable);
    }
    // subscribes to accts length check requests 
    pubsub.subscribe("check accts length", checkAcctsLen);
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
                event = "delete account";
                accts.splice(a, 1);
            } 
            if (version) {
                event = "delete version";
                accts[a].splice(v, 1);
            }
            response.event = event;
            pubsub.publish("_acct handled", response);
            pubsub.publish( "_updAccts", listAccts(true) );
            return
        }
        if (acct) {
            for (let i = 0; i < accts.length; i += 1 ) {
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
    // transforms data for conflicts table rendering
    let prepareConflicts = (data) => {
        console.log("transforming acct data: ", data);
        let context = {};
        let tableData = [];
        let organize = (file, data) => {

        }
        let pushEntry = (file, specOrder) => {
            for (let entry of data[file]) {
                let row = {};
                row.file = file;
                if (specOrder === "N/A" ) {
                    row.where="N/A"
                } else {
                    row.where = entry[specOrder];
                }
                if (entry.CONDITION) {
                    row.value = entry.CONDITION;
                    if (entry.ACTIVE === false) {
                        row.value = "(!) " + row.value;
                    }
                } else {
                        row.value = "No Condition!"
                }
                row.desc = entry.DESC;
                tableData.push(row);
            }
        }
        let tryToPush = (file, order) => {
            return _.attempt( pushEntry(file, order) );
        };
        tryToPush("autoa", "ORDER");
        tryToPush("autob", "ORDER");
        tryToPush("dcl", "ORDER");
        tryToPush("sched_cond", "ORDER");
        tryToPush("taction", "N/A");
        tryToPush("remind", "N/A");
        for (let entry of data.form) {
            let row = {}
            let page = "page: " + entry.PAGE_NUM;
            let eRow = " row: " + entry.L_ROW
            row.file = "oe_form: formula";
            row.where = page + eRow;
            row.desc = entry.GET_FIELD;
            if (entry.FORMULA) {
                row.value = entry.FORMULA;
                tableData.push(row);
            }
            if (entry.URL) {
                row.value = entry.URL;
                tableData.push(row);
            }
        }
        for (let entry of data.disp_cond) {
            let row = {};
            row.file = "disp_cond";
            row.where = "N/A"
            if (entry.TESTFIELD) {
                row.value = entry.TESTFIELD;
            } 
            if (entry.DATA1) {
                row.value += " " + entry.DATA1;
            }
            if (entry.DATA2) {
                row.value += " " + entry.DATA2;
            }
            row.desc = entry.DESCR;
            tableData.push(row);
        }
        for (let entry of data.view) {
            let row = {};
            row.file = "view";
            row.where = entry.ORDER;
            row.value = entry.FORMULA;
            row.desc = entry.TEMPLATE;
            tableData.push(row);
        }
        context.entries = tableData;
        pubsub.publish("return conflicts data", context);
    }
    // retrieves client data from accts for table load requests
    let tableRequest = (topics, request) => {
        let nIndex, newest, propsAdded;
        let addProps = (obj) => {
            let newObj = obj;
            let objProps = Object.keys(obj);
            let addProps = _.difference(allProps, objProps);
            for (let prop of addProps) {
                newObj[prop] = [];
            }
            return newObj;
        }
        // retrieves client data from accts
        for (let acct of accts) {
            if ( acct[0].acct === Number(request.acct) ) {
                nIndex = acct.length - 1;
                newest =  acct[nIndex].info;
                // data transformed based on type of table requested
                if (request.table === "conflicts") {
                    // prepare newest version for rendering
                    propsAdded = addProps(newest);
                    prepareConflicts(propsAdded);
                }
                if (request.table === "before-after" ) {
                    // sets data props as oldest & newest versions
                    // data.acct1 = acct[0];
                    // data.acct2 = newest;
                    console.log("before-after requested");
                }
                if (request.table === "cross-account") {
                    console.log("cross-account requested");
                }
            }
        }
    }
    // subscribes to data requests for rendering tables
    pubsub.subscribe("table data request", tableRequest);
});