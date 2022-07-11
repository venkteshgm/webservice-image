#!/bin/bash

# pwd
# cd /home/ec2-user/webservice
# rm -rf node_modules
# sudo npm i#!/bin/bash

pwd
cd /home/ec2-user/webservice
sudo systemctl enable webservice
sudo systemctl start webservice
ls -lrt
sudo pm2 reload all --update-env
sudo pm2 start index.js

if [ $? == 0 ]; then echo "Application started successfully"; else echo "Something went wrong while starting the application"; fi

sudo pm2 status

