/* global  Handlebars, pubsub, io, _ */

jQuery(($) => {
    const acct_input = $("#acct-input");
    const doc_select = $("#doc-select");
    const query_button = $("#query-button");
    const doc_select_opts = $("#doc-select-opts");
    const docs = [
        { tag: "CUSTOMER", name: "Customer database" },
        { tag: "PT_HIST",  name: "History" },
        { tag: "OE_PKLST", name: "Picklists" },
        { tag: "PTONCALL", name: "On-Call" },
        { tag: "OE_SKIP",  name: "Skiplists" },
        { tag: "PT_CONTC", name: "Contacts" },
        { tag: "OE_ADMIN", name: "Admin" },
        { tag: "OE_ABEND", name: "Abend" },
        { tag: "PT_AUTOB", name: "Autos on Deliver" },
        { tag: "OE_HELP",  name: "Help Topics" },
        { tag: "OE_FORM",  name: "Form" },
        { tag: "PT_AUTOA", name: "Autos on Save" },
        { tag: "ORDERS",   name: "Orders" },
    ]
    // compiles handlebars to render templates from markup
    let renderTpl = (tpl, context, parent, contextName) => {
        let data = {};
        data.tpl = tpl;
        data.context = {};
        data.context[contextName] = context
        data.parent = parent;
        // console.log("rendering: ", data);
        pubsub.publish("render handlebars", data);
    }
    // render document select options on load
    let docReady = () => {
        renderTpl(doc_select_opts, docs, doc_select, "docs");
    };
    pubsub.subscribe("handlebars ready", docReady);
    query_button.on("click", () => {
        let acct = acct_input.val();
        let doc = doc_select.val();
        let format = acct + "/" + doc + "?&out=json";
        pubsub.publish("query requested", format);
    });
});