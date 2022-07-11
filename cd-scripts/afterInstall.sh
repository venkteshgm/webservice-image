#!/bin/bash

pwd
cd /home/ec2-user/webservice
sudo npm i

sudo cp /home/ec2-user/webservice/cloudwatch-config.json /opt/aws/amazon-cloudwatch-agent/etc/
x
sleep 3

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
	-a fetch-config -m ec2 \
	-c file:/opt/aws/amazon-cloudwatch-agent/etc/cloudwatch-config.json -s