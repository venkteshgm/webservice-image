let helper = {};
// HELPER FUNCTIONS FOR DATA TRANSFORMATION

/* create new user object from sequelize result */
helper.changeUserDataUpdateAttributes = function(user){
    var newUser = {};
    newUser.id = user.id;
    newUser.first_name = user.first_name;
    newUser.last_name = user.last_name;
    newUser.username = user.username;
    newUser.account_created = user.account_created;
    newUser.account_updated = user.account_updated;
    return newUser;
}
helper.changeImageAttributes = function(imageAttributes){
    console.log("image details:",imageAttributes);
    var newImageObject = {};
    let date = imageAttributes.upload_date;
    newImageObject.file_name = imageAttributes.file_name;
    newImageObject.id = imageAttributes.id;
    newImageObject.url = imageAttributes.url;
    newImageObject.upload_date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    newImageObject.user_id = imageAttributes.user_id;
    return newImageObject;
}

module.exports = helper;