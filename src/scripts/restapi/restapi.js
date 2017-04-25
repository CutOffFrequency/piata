/* global  Handlebars, pubsub, io, _ */

jQuery(($) => {
    const url = "https://rest-api.bpeinc.com/v1/ORDENTRY/";
    
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