#!/bin/sh
# @Author: dm.yang
# @Date:   2014-10-14 14:29:29
# @Last Modified by:   dm.yang
# @Last Modified time: 2015-04-10 13:58:02

if [ ! -f "$(pwd)/index.js" ]
then
    cd ../
fi

echo 'start rshell-monit by pm2'

NODE_ENV=production pm2 start "$(pwd)/index.js" -i 1 -n rshell-monit -x --node-args="--harmony-generators"
# pm2 start "$(pwd)/pm2_deploy.json"

echo 'start rshell-monit OK'
