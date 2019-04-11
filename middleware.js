'use strict';

exports.getEventAndContext = async (request, response, next) => {
    if (typeof response === 'function') {
        // for koa
        let next = response;
        request['payload'] = {};
        if (request.headers['x-apigateway-event']) {
            let event = JSON.parse(decodeURIComponent(request.headers['x-apigateway-event']));
            request['payload']['event'] = event;
        }
        if (request.headers['x-apigateway-context']) {
            let context = JSON.parse(decodeURIComponent(request.headers['x-apigateway-context']));
            request['payload']['context'] = context;
        }
        await next();
    } else {
        // for express
        request['payload'] = {};
        if (request.headers['x-apigateway-event']) {
            let event = JSON.parse(decodeURIComponent(request.headers['x-apigateway-event']));
            request['payload']['event'] = event;
        }
        if (request.headers['x-apigateway-context']) {
            let context = JSON.parse(decodeURIComponent(request.headers['x-apigateway-context']));
            request['payload']['context'] = context;
        }
        next();
    }
};
