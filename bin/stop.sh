#!/bin/sh
# @Author: dm.yang
# @Date:   2014-10-14 14:50:41
# @Last Modified by:   dm.yang
# @Last Modified time: 2015-04-10 13:58:32

echo 'stop rshell-monit by pm2'

pm2 stop rshell-monit

echo 'stop rshell-monit OK'
