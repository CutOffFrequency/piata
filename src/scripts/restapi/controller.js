jQuery(($) => {
    let renderTpl = (tpl, context, parent) => {
        let template, tplScript, html;
        if (parent.children().length > 0) {
            parent.empty();
        }
        template = tpl.html();
        tplScript = Handlebars.compile(template);
        html = tplScript(context);
        parent.append(html);
    }
});