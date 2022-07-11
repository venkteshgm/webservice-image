#!/bin/bash
sleep 5

sudo yum update

echo "########### INSTALLING RUBY"

sudo yum install -y ruby

echo "########### INSTALLING WGET"

sudo yum install wget

if [ $? == 0 ]; then echo "########### WGET INSTALLED"; else echo "########### ERROR WHILE INSTALLING WGET"; fi

CODEDEPLOY_BIN="/opt/codedeploy-agent/bin/codedeploy-agent"
$CODEDEPLOY_BIN stop
sudo yum erase codedeploy-agent -y

sleep 5

cd /home/ec2-user

echo "########### INSTALLING CODEDEPLOY AGENT"

wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install

BACK_PID=$!

wait $BACK_PID

#ls -lrt

chmod +x ./install

if [ $? == 0 ]; then echo "########### CHANGED INSTALL PERMISSIONS"; else echo "########### ERROR WHILE CHANGING INSTALL PERMISSIONS"; fi

#Install the latest version of the CodeDeploy agent
sudo ./install auto >./codedeploy-logfile

if [ $? == 0 ]; then echo "########### CODEDEPLOY AGENT INSTALLED"; else
    echo "########### ERROR WHILE INSTALLING CODEDEPLOY AGENT"
    cat codedeploy-logfile
fi

echo "########### CODEDEPLOY STATUS"

sudo service codedeploy-agent status

echo "################## CLOUDWATCH AGENT"

sudo yum install -y amazon-cloudwatch-agent 

echo "########### INSTALLING NODE VIRTUAL MACHINE"

#install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

#activate nvm
. ~/.nvm/nvm.sh

echo "########### INSTALLING NODE"

#install latest version of node
nvm install node

if [ $? == 0 ]; then echo "########### INSTALLED NODE"; else echo "########### ERROR WHILE INSTALLING NODE"; fi

#install mysql
sudo yum update -y

sudo wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm

echo "########### INSTALLING MYSQL CLIENT"

sudo yum install -y mysql-community-client

#Install necessary dev tools
sudo yum install -y gcc gcc-c++ make openssl-devel git

#Install Node.js
curl --silent --location https://rpm.nodesource.com/setup_16.x | sudo bash -

sudo yum install -y nodejs

cd ~/webservice

sleep 5

#start the application using pm2
sudo npm install pm2@latest -g

sudo pm2 startup systemd --service-name webservice

echo "########### RELOADING ALL ENVIRONMENT VARIABLES"

sudo pm2 reload all --update-env

echo "########### STARTING SERVER"

sudo pm2 start index.js

sudo pm2 save
