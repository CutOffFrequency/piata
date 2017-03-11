jQuery(($) => {
    // jquery dom elements
    const acct_alert    = $("#acct-alert");
    const acct_list     = $("#acct-list");
    const acct_select   = $("#acct-select");
    const view_select   = $("#view-select");
    const view_load     = $("#view-load");
    const acct_manage   = $("#acct-manage");
    const acct_mgmt_tpl = $("#acct-mgmt-tpl");
    const acct_sel_opts = $("#acct-select-opts-tpl");
    let viewDisabled;
    // compiles handlebars to render templates from markup
    let renderTpl = (tpl, context, parent) => {
        let template, tplScript, html;
        if ( parent.children().length > 0 ){
            parent.empty();
        }
        template = tpl.html();
        tplScript = Handlebars.compile(template);
        html = tplScript(context);
        parent.append(html);
    }
    // populates accounts select
    let popAcctSel = (topics, accts_listed) => {
        let context = {};
        context.accts = [];
        for (let acct of accts_listed) {
            let account = {};
            account.account = acct;
            context.accts.push(account);
        }
        if (!accts_listed) {
            context.accts.push({
                account: "*Account list is empty*"
            })
        }
        renderTpl(acct_sel_opts, context, acct_select);
    }
    // subscribes to shallow list response
    pubsub.subscribe("return shallow accts", popAcctSel);
    // handles state changes when accts is emptied / populated
    let acctsToggled = disabling => {
        // disables / enables data view options
        let togOpts = d => {
            if (d) {
                acct_manage.val("Load an Account to Continue");
            } else {
                acct_manage.val("Manage Accounts Loaded");
            }
            view_load.prop("disabled", d);
            view_select.prop("disabled", d);
            acct_select.prop("disabled", d);
            acct_manage.prop("disabled", d);
            viewDisabled = d;
        };
        if ( viewDisabled && !disabling || !viewDisabled && disabling ) {
            togOpts(disabling);
        }
        pubsub.publish("req shallow accts");
    }
    // disables view options on load
    acctsToggled(true);
    // updates alert for user feedback
    let updAlert = (topics, eventHandled) => {
        // updates alert color
        let alertType = type => {
            switch(type) {
                case "success":
                    acct_alert.removeClass("alert-danger")
                    .removeClass("alert-warning")
                    .addClass("alert-success");
                    break;
                case "danger":
                    acct_alert.removeClass("alert-sucess")
                    .removeClass("alert-warning")
                    .addClass("alert-danger");
                    break;
                case "warning":
                    acct_alert.removeClass("alert-danger")
                    .removeClass("alert-success")
                    .addClass("alert-warning");
                    break;
                default:
                    alert("error in alertType function");
            }
        };
        // updates alert text
        let alertText = (event, acct) => {
            let errorize = err => {
                console.log(err);
            }
            console.log("alerting: ", event, acct);
            if ( acct_alert.hasClass("hidden") ) {
                acct_alert.removeClass("hidden")
            }
            switch(event) {
                case "found":
                    alertType("warning");
                    acct_alert.text(
                        acct + " is loading, please wait..."
                    );
                    break;
                case "new account":
                    alertType("success");
                    acct_alert.text(
                        acct + " successfully loaded - ready to examine"
                    );
                    acctsToggled(false);
                    break;
                case "new version":
                    alertType("warning");
                    acct_alert.text(
                        acct + " reloaded - a new version is available"
                    );
                    break;
                case "match found":
                    alertType("success");
                    acct_alert.text(
                        acct + " matches version cached, no changes made"
                    );
                    break;
                case "invalid":
                    alertType("danger");
                    acct_alert.text(
                        "Input value (" + acct +
                        ") is invalid or validation failed"
                    );
                    break;
                case "delete account":
                    alertType("warning");
                    acct_alert.text(
                        acct + ": all versions were removed"
                    );
                    acctsToggled(true);
                    break;
                case "delete version":
                    alertType("warning");
                    acct_alert.text(
                        acct + " version was removed, list reindexed"
                    );
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
                    let errAcct, errEvent, errMsg;
                    errAcct = acct ? 
                        "acct: " + acct : "no acct data!"
                    errEvent = event ? 
                        "event: " + event : "no event data!"
                    errMsg = errAcct + " " + errEvent
                    errorize(errMsg);
            }
        }
        alertText(eventHandled.event, eventHandled.acct);
    };
    // subscribes to alert-element update events
    pubsub.subscribe("_acct handled", updAlert);
    let update_list = (topics, accts_listed) => {
        let context = {};
        context.account = accts_listed;
        renderTpl(acct_mgmt_tpl, context, acct_list);
    };
    // subscribes to update event for account list modal
    pubsub.subscribe("_updAccts", update_list);
});