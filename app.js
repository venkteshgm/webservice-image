// require('./config/env.config');

const express = require("express");
const app = express();

const users = require('./config/user');
const images = require('./config/image');
const auth = require("basic-auth");
const bodyParser = require("body-parser"); // parse application/x-www-form-urlencoded
 app.use(bodyParser.urlencoded({ extended: false })); // parse application/json 
 app.use(bodyParser.json()); //express middleware 
 app.use(express.json({ limit: "30mb", extended: true })); 
 app.use(express.urlencoded({ limit: "30mb", extended: true }));
//API ENDPOINTS

let metrics = require('./cloudwatch-metrics')
const log = require("./logs")
const logger = log.getLogger('logs');

const multerUpload = require('./config/multer.config');

const dbCon = require('./config/db');

app.get("/healthz", (req, res) => {
  logger.info("[INFO]: /healthz endpoint hit");
    metrics.increment('HealthCheck.GET.Check_Healthz');
  res.sendStatus(200);
});

app.get('/v1/resendVerificationEmail', (req, res) => {
  users.resendVerificationEmail(req, res, dbCon.userTable);
});

app.get('/v1/verifyUserEmail', (req, res) => {
  users.verifyUser(req,res, dbCon.userTable);
});

app.post("/v1/user/self/pic", multerUpload.single('file'), (req, res) => {
  images.addOrUpdateImage(req, res, dbCon);
  
});

app.get("/v1/user/self/pic", (req, res) => {
  images.getImage(req, res, dbCon);
});

app.delete("/v1/user/self/pic", (req, res) => {
  images.deleteImage(req, res, dbCon);
});

app.get("/v1/user/self",(req,res) => {
  users.getUser(req,res, dbCon.userTable);
});

app.put("/v1/user/self",(req,res)=>{
  users.updateUser(req, res, dbCon.userTable);
});

app.post("/v1/user", (req, res) => {
  if (req.body == null || Object.keys(req.body).length === 0) {
    res.status(400).json();
  }
  else{
    users.createUser(req, res, dbCon.userTable);
  }
  
});

app.get("*", (req, res) => {
  res.sendStatus(404);
});

app.post("*", (req, res) => {
  res.sendStatus(404);
});

app.put("*", (req, res) => {
  res.sendStatus(404);
});

app.delete("*", (req, res) => {
  res.sendStatus(404);
});
module.exports = app;
