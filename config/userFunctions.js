const authTools = require('./auth_tools');
const queries = require('./queries');
//  USER HELPER FUNCTIONS
let userFunctions = {}

/* update user data in case of auth success  */
userFunctions.updateUser = async function(req, userDetails, userTable){
    firstName = req.body.first_name;
    lastName = req.body.last_name;
    password = req.body.password;
    await queries.updateFirstName(userDetails.username, firstName, userTable);
    await queries.updateLastName(userDetails.username, lastName, userTable);
    await queries.updatePassword(userDetails.username, authTools.passwordGenerator(password), userTable);
}
module.exports = userFunctions