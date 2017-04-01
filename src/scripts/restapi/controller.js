jQuery(($) => {
    const acct_select = $("#acct-select");
    // compiles handlebars to render templates from markup
    let renderTpl = (tpl, context, parent) => {
        let data = {};
        data.tpl = tpl;
        data.context = context;
        data.parent = parent;
        pubsub.publish("render handlebars", data);
    }
});