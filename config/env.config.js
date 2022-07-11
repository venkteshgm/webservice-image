const dotenv = require('dotenv');

dotenv.config({
    path: __dirname + '/config.env'
})
console.log("Env init")

module.exports = dotenv