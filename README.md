# webservice
networks and cloud computing assignments  
Made using Node.js, Express.js  
To run, you need to install Node.js on your machine
refer to this: https://nodejs.org/en/download/ for installation  
Move to the cloned repository and run "npm install" to install all packages mentioned in the dependencies section of package.json  
To run the server, use "npm start" that runs the command saved under the scripts-> start section of package.json  
Server listens on port 3000 by default  
Use postman for testing API endpoints  
For assignment 02: APIs are built as per specifications here: https://app.swaggerhub.com/apis-docs/spring2022-csye6225/app/a02#/  
  
  For assignment 4, post merge github workflow sequence has been added which can be seen in after-merge.yml  
  Amazon Machine Instance(AMI) is created as per specifications mentioned in application-ami.pkr.hcl  
  installer.sh sets up the environment in the EC2 instance and installs mysql, node and launches the node app  
  App endpoints can be reached using its public IP address  


Full application manages User data, sends registration information via Amazon Simple Email Service.  
Github Actions triggers test workflow on merge request to main branch of organizational repository.  
Upon passing of tests and successful merge, another workflow is triggered to build/update AMI on AWS.  
