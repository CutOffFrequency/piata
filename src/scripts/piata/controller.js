jQuery(($) => {
    // jquery dom elements
    const acct_alert = $("#acct-alert");
    const acct_list = $("#acct-list");
    const status_div = $("#status-outer-div");
    const status_bar = $("#status-inner-div");
    const status_label = $("#status-label");
    // updates progress bar
    let progressBar = (percent, hide) => {
        if (hide) { 
            status_div.addClass("hidden");
        } else {
            status_div.removeClass("hidden");
        }
        console.log("status label should read: ", percent, "%");
        status_label.innerText = percent + "%";
        status_bar.css("width", percent + "%");
    };
    let updateProgress = (topics, progress) => {
        progressBar(progress.percent, progress.hide);
    }
    // subscribes to pub sub for progress bar events
    pubsub.subscribe("update progress", updateProgress)
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
                    progressBar(0);
                    acct_alert.text("Account is loading, please wait...");
                    break;
                case "new account":
                    alertType("success");
                    progressBar(100);
                    acct_alert.text(acct + " successfully loaded - ready to examine");
                    break;
                case "new version":
                    alertType("warning");
                    acct_alert.text(acct + " has been reloaded - a new version is available");
                    break;
                case "match found":
                    alertType("success");
                    acct_alert.text(acct + " successfully re-loaded - ready to examine");
                    break;
                case "invalid":
                    alertType("danger");
                    progressBar(null, true);
                    acct_alert.text(acct + " is invalid - Enter a correct account #");
                    break;
                case "delete":
                    alertType("warning");
                    progressBar(null, true);
                    acct_alert.text(acct + " was removed");
                    break;
                case "JSON error":
                    alertType("danger");
                    progressBar(null, true);
                    acct_alert.text("an error occurred parsing the returned object from python");
                    break;
                case "null data":
                    alertType("danger");
                    progressBar(null, true);
                    acct_alert.text("request processed but null acct data returned!");
                    break;
                default:
                    let errMsg
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
                '<span class="acctListed"><p class="acct_listed">'
                 + acct +
                '</p><span class="label label-danger acct_isted remove" id="remove_'
                 + acct +
                '">Remove</span></span><div></div>'
            );
        }
    };
    // subscribes to update event for account list modal
    pubsub.subscribe("_updAccts", update_list);
});