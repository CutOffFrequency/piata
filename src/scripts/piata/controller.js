jQuery(($) => {
    // jquery dom elements
    const acctAlert = $("#acctAlert");
    const acctList = $("#acctList");
    const statusDiv = $("#statusProgress");
    const statusBar = $("#statusBar");
    const statusLabel = $("#statusLabel");
    // updates progress bar
    let progressBar = (percent, hide) => {
        if (hide) { 
            statusDiv.addClass("hidden");
        } else {
            statusDiv.removeClass("hidden");
        }
        console.log("status lable should read: ", percent, "%");
        statusLabel.innerText = percent + "%";
        statusBar.css("width", percent + "%");
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
                    acctAlert.removeClass("alert-danger").removeClass("alert-warning").addClass("alert-success");
                    break;
                case "danger":
                    acctAlert.removeClass("alert-sucess").removeClass("alert-warning").addClass("alert-danger");
                    break;
                case "warning":
                    acctAlert.removeClass("alert-danger").removeClass("alert-success").addClass("alert-warning");
                    break;
                default:
                    alert("error in alertType function");
            }
        };
        // updates alert text
        let alertText = (event, acct) => {
            console.log("alerting: ",event,acct);
            if ( acctAlert.hasClass("hidden") ) { acctAlert.removeClass("hidden") }
            switch(event) {
                case "found":
                    alertType("warning");
                    progressBar(0);
                    acctAlert.text("Account" + acct + " is loading, please wait...");
                    break;
                case "new account":
                    alertType("success");
                    progressBar(100);
                    acctAlert.text(acct + " successfully loaded - ready to examine");
                    break;
                case "new version":
                    alertType("warning");
                    acctAlert.text(acct + "has been reloaded - a new version is available");
                    break;
                case "match found":
                    alertType("success");
                    acctAlert.text(acct + " successfully re-loaded - ready to examine");
                    break;
                case "invalid":
                    alertType("danger");
                    progressBar(null, true);
                    acctAlert.text(acct + " is invalid - Enter a correct account #");
                    break;
                case "delete":
                    alertType("warning");
                    progressBar(null, true);
                    acctAlert.text(acct + " was removed");
                    break;
                case "JSON error":
                    alertType("danger");
                    progressBar(null, true);
                    acctAlert.text("an error occurred parsing the returned object from python");
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
    let updAcctList = (accts) => {
        if ( acctList.children().length > 0 ){
            acctList.empty();
        }
        for (let acct of accts) {
            acctList.append(
                '<span class="acctListed"><p class="acctListed">'
                 + acct +
                '</p><span class="label label-danger acctListed remove" id="'
                 + acct +
                '">Remove</span></span><div></div>'
            );
        }
    };
    // subscribes to update event for account list modal
    pubsub.subscribe("_updAccts", updAcctList);
});