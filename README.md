# serverlessplus

## 简介

`serverlessplus` 是一个简单易用的工具，它可以帮助你将现有的 `express` / `koa` / `restify` 等框架构建的应用迁移到[腾讯云无服务云函数](https://cloud.tencent.com/product/scf)（Tencent Cloud Serverless Cloud Function）上。

## 开始使用

```shell
$ npm install serverlessplus
```

## 示例

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
};

const proxy = serverlessplus.createProxy(app, options);

exports.main_handler = (event, context) => {
    return proxy.serveRequest(event, context);
}
```

## 项目状态

`serverlessplus` 处于活跃开发中，`API` 可能中未来的版本中发生变更。
