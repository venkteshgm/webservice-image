const bcrypt = require("bcrypt");
const salt = "$2b$10$nVHHiPGQLU/798TGy681pe";
const auth = require('basic-auth');
const queries = require('./queries');
// AUTHENTICATION FUNCTIONS
let authTools = {};

/* bcrypt password generator using salt */
authTools.passwordGenerator = function(plaintextPassword){
    if(!plaintextPassword || plaintextPassword == undefined || plaintextPassword == "")
        return false;
    const hash = bcrypt.hashSync(plaintextPassword, salt);
    return hash;
};

/* bcrypt password & hash comparator */
authTools.comparePasswords = function(plaintextPassword, hash){
    return bcrypt.compareSync(plaintextPassword, hash);
};

/* authorization token verification */
authTools.tokenAuth = async function(req, userTable){
    var user = auth(req);
    const username = user.name;
    const password = user.pass;
    var queriedUser = await queries.getUserFromUsername(username, userTable);
    if(queriedUser == false || !this.comparePasswords(password, queriedUser.password)){
        return false;
    }
    else{
        return queriedUser;
    }
}
module.exports = authTools;