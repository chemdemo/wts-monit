![wts-monit](./images/logo.png)

# wts-monit
[![NPM version](https://badge.fury.io/js/wts-monit.png)](https://npmjs.org/package/wts-monit)

> Send commands to remote terminal to execute and then show result on the web console.

[中文说明](https://github.com/chemdemo/wts-monit/blob/master/README_zh-CN.md)

WTS monitor launch a socket server as RPC server, any remote(or maybe the monitor self) terminal can create a socket then connect to the RPC server.

Also WTS monitor will launch a websocket server to manage all remote clients.


The system architecture:

![wts architecture](https://raw.githubusercontent.com/chemdemo/wts-monit/master/images/architecture.png)

runtime screenshots:

![wts architecture](https://raw.githubusercontent.com/chemdemo/wts-monit/master/images/wts.png)


### Usage

- install via npm

``` bash
$ npm install wts-monit
```

or just clone from github:

``` bash
$ git clone https://github.com/chemdemo/wts-monit.git
```

- install dependencies

``` bash
$ npm install
```

- conf server(s) port

``` bash
$ vim conf/index.js
```

- run as debug

``` bash
$ node --harmony index.js # Node.js v0.12+
$ node/iojs index.js # iojs
```

- deploy via `pm2`

``` bash
$ pm2 start pm2_deploy.json
```

then open `http://[YOUR HOST]:[YOUR PORT]` in browser.

### socket clients written by different languages

- Node.js client: [wts-node](https://github.com/chemdemo/wts-node)

### Todo

- login access control

- command access control

### License

Copyright (c) 2015, chemdemo (MIT License)
