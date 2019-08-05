import * as Koa2Application from 'koa';
import { Application as ExpressApplication } from 'express';
import { Server as RestifyServer } from 'restify';
import { RequestOptions as HttpRequestOptions, IncomingMessage as HttpIncomingMessage, Server as HttpServer } from "http";

type ServerApplication = Koa2Application | ExpressApplication | RestifyServer;

interface ProxyOptions {
    framework: 'express' | 'koa' | 'koa2' | 'restify',
    binaryMIMETypes?: ReadonlyArray<string>
}

interface APIGatewayRequestIdentity {
    secretId?: string
}

interface APIGatewayProxyRequestContext {
    serviceId: string,
    path: string,
    httpMethod: string,
    requestId: string,
    stage: string,
    identity: APIGatewayRequestIdentity,
    sourceIp: string,
    websocketEnable?: boolean
}

interface APIGatewayProxyRequestEvent {
    path: string,
    queryString: { [key: string]: string },
    httpMethod: string,
    headers: { [key: string]: string },
    queryStringParameters?: { [key: string]: string },
    pathParameters?: { [key: string]: string },
    headerParameters?: { [key: string]: string },
    stageVariables?: { [key: string]: string },
    requestContext: APIGatewayProxyRequestContext,
    body: string,
    isBase64Encoded?: boolean
}

interface APIGatewayProxyResponse {
    statusCode: number,
    headers: { [key: string]: string },
    body: string,
    isBase64Encoded?: boolean
}

declare class Proxy {
    constructor(server: HttpServer, options: ProxyOptions);
    start(): Promise<HttpServer>;
    getRemoteIP(event: APIGatewayProxyRequestEvent): string | null;
    buildRequestOptions(event: APIGatewayProxyRequestEvent, context: APIGatewayProxyRequestContext): HttpRequestOptions;
    isBinaryContentType(contentType: string): boolean;
    sendResponse(error: Error, response: HttpIncomingMessage, context: APIGatewayProxyRequestContext): void;
    serveRequest(event: APIGatewayProxyRequestEvent, context: APIGatewayProxyRequestContext): Promise<void>;
}

export declare function createProxy(app: ServerApplication, options: ProxyOptions): Proxy;

export type Handler = (event: APIGatewayProxyRequestEvent, context: APIGatewayProxyRequestContext) => void;
