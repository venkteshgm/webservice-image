// const userTable = require("./db").userTable;
//QUERIES TO USERS TABLE
let queries = {}

/* get user data from username(mail) */
queries.getUserFromUsername = async function(username, userTable){
    queriedUser = await userTable.findOne({
        where:{
            'username': username
        }
    });
    if(queriedUser == null){
        return false;
    }
    else{
        return queriedUser;
    }
}
/* update user attributes(does not work) */
// queries.updateUserAttribute = async function(username, header, value){
//     console.log(username, header, value);
//     if(value != undefined && value != ""){
//         key = { header : value};
//         await userTable.update({ header : value},{
//             where:{
//                 username: username
//             }
//         });
//     }
// }

/* update user first_name field */
queries.updateFirstName = async function(username, value, userTable){
    if(value != undefined && value != ""){
        await userTable.update({ first_name : value},{
            where:{
                username: username
            }
        });
    }
}

/* update user last_name field */
queries.updateLastName = async function(username, value, userTable){
    if(value != undefined && value != ""){
        await userTable.update({ last_name : value},{
            where:{
                username: username
            }
        });
    }
}

/* update user password field */
queries.updatePassword = async function(username, value, userTable){
    if(value != undefined && value != ""){
        await userTable.update({ password : value},{
            where:{
                username: username
            }
        });
    }
}

module.exports = queries;