# Serverless + JavaScript

## 简介

`serverlessplus` 是一个简单易用的工具，它可以帮助你将现有的 `express` / `koa` / `restify` 等框架构建的应用借助 [API 网关](https://cloud.tencent.com/product/apigateway) 迁移到 [腾讯云无服务云函数](https://cloud.tencent.com/product/scf)（Tencent Cloud Serverless Cloud Function）上。

## 开始使用

```shell
$ npm install serverlessplus
```

假设有如下 `express` 应用：
```js
// app.js
'use strict';

const express = require('express');
const app = express();

app.get('/', (request, response) => {
    response.end('hello world');
});

app.litsen(8000);
```

可以通过如下简单修改，迁移到 `serverless` 平台上：
```js
// app.js
'use strict';

const express = require('express');
const app = express();

app.get('/', (request, response) => {
    response.end('hello world');
});

// comment out `listen`
// exports your `app`

// app.litsen(8000);
module.exports = app;
```

将服务到入口文件修改为如下内容：
```js
// index.js
'use strict';

const app = require('./app');
const serverlessplus = require('serverlessplus');

const options = {
    binaryMIMETypes: [
        'image/gif',
        'image/png',
        'image/jpeg',
    ],
    framework: 'express',
};

const proxy = serverlessplus.createProxy(app, options);

exports.main_handler = (event, context) => {
    return proxy.serveRequest(event, context);
}
```

## 示例

- [express 示例](https://github.com/serverlessplus/express-example)
- [koa 示例](https://github.com/serverlessplus/koa-example)
- [restify 示例](https://github.com/serverlessplus/restify-example)

## 支持的框架

- [express](https://expressjs.com)
- [koa](https://koajs.com)
- [restify](http://restify.com)
- ...

## 路线图

- 更多 Web 框架的支持
- 对小程序云开发的支持

`serverlessplus` 处于活跃开发中，`API` 可能在未来的版本中发生变更，我们十分欢迎来自社区的贡献，你可以通过 pull request 或者 issue 来参与。
