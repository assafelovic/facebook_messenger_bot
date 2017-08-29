'use strict';

const mongoose = require('mongoose');
var fb_api = require('../api/fb');

// Defining the User schema. Add any additional fields you may need.
const User = mongoose.model('User', {
    first_name: String,
    last_name: String,
    fb_id: String,
    timezone: String,
    gender: String,
    profile_pic: String,
    current_state: String
});

/**
 * If userId doesn't exist in DB, create a new doc. Else, just update key->val.
 * @param user_id
 * @param updates - JSON with user updates
 */
function set(user_id, updates) {
    User.findById(user_id, function (err, user_object) {
        if (user_object) {
            user_object.update({fb_id:user_id}, updates, function (err) {
                console.log(`User ${user_id} exists, saving updates: ${JSON.stringify(updates)}`)
            });
        } else {
            getAndSetNewUser(user_id);
        }
    });
}

/**
 * Get user info by facebook id. This is called when ICM arrives.
 * @param user_id
 * @param incoming_message
 * @param callback
 */
function get(user_id, incoming_message, callback) {
    //Lets try and find user
    User.findById(user_id, function (err, user_object) {
        if (err) {
            console.log(err);
        } else if (user_object) {
            console.log(`User ${user_id} exists. Getting current user object: ${user_object}`)
        } else {
            console.log('User not found!');
        }
        // After getting user object, forward to callback method.
        callback(user_id, incoming_message, user_object);
    });
}

/**
 * If user is not in DB, create new user doc.
 * @param user_id
 */
function getAndSetNewUser(user_id) {
    // Get information from facebook about user basic profile info.
    fb_api.getFBInfo(user_id, function(fb_info) {
        fb_info.current_state = "welcome_message";
        fb_info.fb_id = user_id;
        var user_object = new User(fb_info);
        user_object.save(function (err, user_object) {
            if (err) {
                console.log(err);
            } else {
                console.log(`New user: ${user_id}. Save user object: ${user_object}`)
            }
        });
    });
}

module.exports = {
    set:set,
    get:get
};