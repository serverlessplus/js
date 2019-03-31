'use strict';

const http = require('http');
const url = require('url');

class Proxy {
    constructor(server, options) {
        this.server = server;
        this.server.on('error', (error) => {
            if (error.code == 'EADDRINUSE') {
                this.start();
            } else {
                console.log(error);
            }
        });
        this.options = options || {};
        this.start();
    }

    async start() {
        // communicate via a unix socket
        let sock = `/tmp/plus-${Math.random().toString(36).slice(2)}.sock`;
        this.sock = sock;
        await this.server.listen(sock);
    }

    getRemoteIP(event) {
        // if requests come from console
        // `event.requestContext` would be null
        if (event.requestContext) {
            return event.requestContext.sourceIp || null;
        }
        return null;
    }

    buildRequestOptions(event, context) {
        let headers = event.headers || {};
        // encodeURIComponent is required
        // or you may encounter error like
        // `TypeError: The header content contains invalid characters`
        headers['X-APIGateway-Event'] = encodeURIComponent(JSON.stringify(event));
        headers['X-APIGateway-Context'] = encodeURIComponent(JSON.stringify(context));
        let ip = this.getRemoteIP(event);
        if (ip != null) {
            headers['X-Forwarded-For'] = ip;
        }
        if (event.body) {
            // it seems API Gateway has some bugs
            // `headers['content-length']` and `event.body.length` are not matched
            headers['content-length'] = Buffer.byteLength(Buffer.from(event.body, 'utf8'));
        }
        let method = event.httpMethod || 'GET';
        let path = url.format({
            pathname: event.path,
            query: event.queryString,
        });
        let socketPath = this.sock;
        return {
            method,
            path,
            headers,
            socketPath,
        };
    }

    isBinaryContentType(contentType) {
        let binaryMIMETypes = this.options.binaryMIMETypes || [];
        return binaryMIMETypes.includes(contentType);
    }

    sendResponse(error, response, context) {
        if (error != null) {
            context.succeed({
                isBase64Encoded: false,
                statusCode: 500,
                headers: {},
                body: '',
            });
            return;
        }
        let buffer = [];
        response.on('data', (chunk) => {
            buffer.push(chunk);
        });
        response.on('end', () => {
            let headers = response.headers || {};
            headers['x-powered-by'] = 'serverlessplus';
            // set content type to empty string if not specify explicitly
            // otherwise API Gateway would set it to `application/json`
            headers['Content-Type'] = headers['content-type'] || '';
            let isBinaryContentType = this.isBinaryContentType(headers['Content-Type']);
            let payload = Buffer.concat(buffer).toString(isBinaryContentType ? 'base64' : 'utf8');
            context.succeed({
                isBase64Encoded: isBinaryContentType,
                statusCode: response.statusCode,
                headers: headers,
                body: payload,
            });
        });
    }

    async serveRequest(event, context) {
        // restify.Server wraps http.Server
        if (this.options.framework == 'restify') {
            if (!this.server.server.listening) {
                await this.start();
            }
        } else {
            if (!this.server.listening) {
                await this.start();
            }
        }

        let options = this.buildRequestOptions(event, context);
        let request = http.request(options, (response) => this.sendResponse(null, response, context));
        request.on('error', (error) => {
            console.log(error);
            this.sendResponse(error, null, context);
        });
        if (event.body) {
            request.write(Buffer.from(event.body, 'utf8'));
        }
        request.end();
        // return a promise that never resolves
        return new Promise((resolve, reject) => {});
    }
}

function createProxy(app, options) {
    let createOptions = options || {};
    let framework = createOptions.framework || '';
    framework = framework.toLowerCase();
    switch (framework) {
    case 'express':
        return new Proxy(http.createServer(app), createOptions);
    case 'koa':
    case 'koa2':
        return new Proxy(http.createServer(app.callback()), createOptions);
    case 'restify':
        return new Proxy(app, createOptions);
    default:
        // if (typeof app.listen === 'function') {
        //     return new Proxy(app, createOptions);
        // }
        throw new Error('please specify `framework` field in options');
    }
}

exports.createProxy = createProxy;
