"use strict"; 
let pubsub = {};
((q) => {
    let topics = {},
    subUid = -1;
    // publish event
    // with: name & data (args)
    q.publish = ( topic, args ) => {
        console.log("publishing: ", topic);
        let subscribers, len;
        if ( !topics[topic] ) {
            return false
        }
        subscribers = topics[topic],
        len = subscribers ? subscribers.length : 0;
        while (len--) {
            subscribers[len].func(topic, args);
        }
        return this;
    };
    // subscribe to event
    // with: topic name & callback
    // callback executes when event is observed
    q.subscribe = ( topic, func ) => {
        console.log("found subscription: ", topic);
        if ( !topics[topic] ) {
            topics[topic] = [];
        }
        let token = (++subUid).toString();
        topics[topic].push({
            token: token,
            func: func
        });
        return token;
    };
    // unsubscribe from event
    // based on tokenized ref to subscription
    q.unsubscribe = (token) => {
        for ( let m in topics ) {
            if ( topics[m] ) {
                for ( let i = 0, j = topics[m].length; i < j; i++) {
                    if ( topics[m][i].token === token ) {
                        topics[m].splice(i, 1);
                        return token;
                    }
                }
            }
        }
        return this;
    };
})( pubsub );