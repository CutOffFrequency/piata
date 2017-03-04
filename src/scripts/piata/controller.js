jQuery(($) => {
    // jquery dom elements
    const acct_alert = $("#acct-alert");
    const acct_list = $("#acct-list");
    // updates alert for user feedback
    let updAlert = (topics, eventHandled) => {
        // updates alert color
        let alertType = (type) => {
            switch(type) {
                case "success":
                    acct_alert.removeClass("alert-danger").removeClass("alert-warning").addClass("alert-success");
                    break;
                case "danger":
                    acct_alert.removeClass("alert-sucess").removeClass("alert-warning").addClass("alert-danger");
                    break;
                case "warning":
                    acct_alert.removeClass("alert-danger").removeClass("alert-success").addClass("alert-warning");
                    break;
                default:
                    alert("error in alertType function");
            }
        };
        // updates alert text
        let alertText = (event, acct) => {
            console.log("alerting: ",event,acct);
            if ( acct_alert.hasClass("hidden") ) { acct_alert.removeClass("hidden") }
            switch(event) {
                case "found":
                    alertType("warning");
                    acct_alert.text(acct +
                        " is loading, please wait...");
                    break;
                case "new account":
                    alertType("success");
                    acct_alert.text(acct +
                        " successfully loaded - ready to examine");
                    break;
                case "new version":
                    alertType("warning");
                    acct_alert.text(acct +
                        " has been reloaded - a new version is available");
                    break;
                case "match found":
                    alertType("success");
                    acct_alert.text(acct +
                        " matches version cached, no changes made");
                    break;
                case "invalid":
                    alertType("danger");
                    acct_alert.text(acct +
                        " is invalid or validation failed");
                    break;
                case "delete account":
                    alertType("warning");
                    acct_alert.text(acct +
                        ": all versions were removed");
                    break;
                case "delete version":
                    alertType("warning");
                    acct_alert.text(acct +
                        " version was removed, list reindexed");
                    break;
                case "JSON error":
                    alertType("danger");
                    acct_alert.text("an error occurred parsing the returned object from python");
                    break;
                case "null data":
                    alertType("danger");
                    acct_alert.text("request processed but null acct data returned!");
                    break;
                default:
                    let errMsg;
                    if (event && acct) {
                        errMsg = "event: " + event + " acct: "+ acct;
                    }
                    if (!event && !acct) {
                        errMsg = "no event or acct data!"
                    }
                    if (!event) {
                        errMsg = " acct: " + acct + "no event data!" ;
                    }
                    if (!acct) {
                        errMsg = " event: " + event + "no acct data!";
                    }
                    if (errMsg) {
                       alert("error in updAlert function = ", errMsg);
                    }
            }
        }
        alertText(eventHandled.event, eventHandled.acct);
    };
    // subscribes to alert-element update events
    pubsub.subscribe("_acct handled", updAlert);
    let update_list = (topics, accts_listed) => {
        if ( acct_list.children().length > 0 ){
            acct_list.empty();
        }
        for (let acct of accts_listed) {
            acct_list.append(
                '<span class="acct_listed" ' +
                // account span id
                'id="acct-listed_' + acct.acct +
                '"><p class="acct_listed">' +
                acct.acct + '</p><span class="label ' +
                'label-danger remove remove_acct" ' +
                // acct removal label id
                'id="rem_a_' + acct.acct +
                '">Remove</span></span>'
            );
            if (acct.versions > 1) {
                let parent = $("#acct-listed_" + acct.acct);
                for (let i = 0; i < acct.versions; i++) {
                    let vIndex = i + 1;
                    parent.append(
                        '<span class="acct_version ' +
                        // version span id
                        'id="v_' + vIndex +
                        '">v' + vIndex + '</span><span ' +
                        'class="label label-danger remove ' +
                        'remove_version" ' +
                        // version removal label id
                        'id="rem_a_' + acct.acct + 'v_' + vIndex +
                        '">X</span>'
                    )
                }
            }
        }
    };
    // subscribes to update event for account list modal
    pubsub.subscribe("_updAccts", update_list);
});