#!/bin/sh
# @Author: dm.yang
# @Date:   2014-10-14 14:52:55
# @Last Modified by:   dm.yang
# @Last Modified time: 2014-10-14 15:43:19

CUR_DIR=$(cd $(dirname $0); pwd)

echo "begin exec restart"

if [ ! -f "${CUR_DIR}/start.sh" ]
then
    cd ./bin
fi

sh "$(pwd)/stop.sh"

sleep 1

sh "$(pwd)/start.sh"
