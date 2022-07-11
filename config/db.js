const mysql = require("mysql2");
const { Sequelize } = require("sequelize");
const fs = require('fs');
const rdsCa = fs.readFileSync(__dirname + '/rds-combined-ca-bundle.pem');
// const sequelize = new Sequelize("login", "venktesh", "ganesha123", {
//   host: "localhost",
//   dialect: "mysql",
//   pool: { max: 5, min: 0, idle: 10000 },
// });
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  port: process.env.MYSQL_PORT,
  dialectOptions: {
    ssl: {
        rejectUnauthorized: true,
        ca: [rdsCa]
    }
}
});
//TEST DB CONNECTION
sequelize
  .authenticate()
  .then(() => console.log("Database connected...."))
  .catch((err) => console.log("Error:" + err));

/* Connecting to users table or creating one if it doesn't exist */
const User = sequelize.define("user", {
  id: { type: Sequelize.UUID, primaryKey: true },
  first_name: { type: Sequelize.STRING },
  last_name: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
  username: { type: Sequelize.STRING,
    allowNull: false },
  status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "Not Verified"
  }
},
{ /* renaming default timestamp fields */
  createdAt:'account_created',
  updatedAt: 'account_updated'
  
});

const Image = sequelize.define("image", {
  id: { type: Sequelize.UUID, primaryKey: true },
  file_name: { type: Sequelize.STRING },
  url: { type: Sequelize.STRING },
  // user_id: { type: Sequelize.STRING }
},
{
  updatedAt: 'upload_date'
});
Image.belongsTo(User, {foreignKey : 'user_id'});
sequelize
  .sync({ alter: true })
  .then((result) => {
    console.log("Sync successful");
  })
  .catch((err) => {
    console.log("table didn't sync");
    console.log(err);
  });
console.log("The table for the User model was just (re)created!");

const dbCon = {}
dbCon.userTable = User;
dbCon.imageTable = Image;
module.exports = dbCon;
