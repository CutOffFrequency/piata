/* global  Handlebars, pubsub, io, _ */

jQuery(($) => {

    let url;

    let piApi = (topics, api) => {
        url = api.pinrest
    }
    pubsub.subscribe("initialize pirest", piApi);
    
    let handleQuery = (topics, requested) => {
        let request = new Request(url + requested);
        fetch(request, {
            credentials: "include"
        })
            .then( (response) => {
                return response.json()
            })
            .then ( (json) => {
                console.log("json: ", json);
            })
    }
    pubsub.subscribe("query requested", handleQuery);

});