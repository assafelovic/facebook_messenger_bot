'use strict'

const mongoose = require('mongoose');
const User = mongoose.model('User', {_id: String, name: String, profile_image_url: String, phone_number: String, current_state: String});

/**
 * Asynchronous method
 * If userId doesn't exist in DB, create a new doc. Else, just update key->val.
 * @param user_id
 * @param key
 * @param val
 */
function setUserFieldById(user_id, key, val) {
    User.findById(user_id, function (err, userObj) {
        if (err) {
            console.log(err);
            // User is found. modify key->val
        } else if (userObj) {
            userObj[key] = val;
            userObj.save(function (err) {
            });
            console.log('User '+user_id+' exists. Saving current ' +key+' state:', userObj[key]);
        }
        // New user. Add it to module
        else {
            getAndSetNewUser(user_id);
        }
    });
}

/**
 * Asynchronous method
 * If user is not in DB, create new user doc.
 * @param user_id
 */
function getAndSetNewUser(user_id) {
    // Default user info. Additional info can be set if using additional facebook API for image and name retrieval.
    var user = new User({
        "_id": user_id,
        "name": "",
        "profile_image_url": "",
        "phone_number": null,
        "current_state": "welcome_message"
    });
    user.save(function (err, userObj) {
        if (err) {
            console.log(err);
        } else {
            console.log('New User ' + user_id + '. saved new user:', userObj);
        }
    });
}

/**
 * Get user info by facebook id. This is called when ICM arrives.
 * @param user_id
 * @param incomingMessage
 * @param callback
 */
function getUserById(user_id, incomingMessage, callback) {
    var result = null;
    //Lets try to Find a user
    User.findById(user_id, function (err, userObj) {
        if (err) {
            console.log(err);
        } else if (userObj) {
            result = userObj;
            console.log('User ' + user_id + ' exists. Getting current user object:', userObj);
        } else {
            console.log('User not found!');
        }
        // After getting user object, forward to callback method.
        callback(user_id, incomingMessage, userObj);
    });
}

module.exports = {
    setUserFieldById:setUserFieldById,
    getUserById:getUserById
};