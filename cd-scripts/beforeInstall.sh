#!/bin/bash

sudo pm2 status server
echo "Stopping pm2 process"

sudo pm2 stop server

echo "Deleting pm2 process"

sudo pm2 delete server

sudo pm2 status

cd /home/ec2-user/webservice
rm -rf node_modules

#echo "Getting the process id"
#PID=`ps -eaf | grep "server.js" | grep -v grep`
#echo $PID
#echo "Process id not empty ? $PID"
#if [[ "" !=  "$PID" ]]; then
#  echo "Kil#!/bin/bash

#############################################

sudo pm2 status server
echo "Stopping pm2 process"

sudo pm2 stop server

echo "Deleting pm2 process"

sudo pm2 delete server

sudo pm2 status

##############################################

#echo "Getting the process id"
#PID=`ps -eaf | grep "server.js" | grep -v grep`
#echo $PID
#echo "Process id not empty ? $PID"
#if [[ "" !=  "$PID" ]]; then
#  echo "Killing $PID"
#  sudo kill -9 $PID
#fi