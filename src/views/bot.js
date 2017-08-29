'use strict';

const express = require('express'),
	request = require('request'),
	user_models = require('../models/user'),
	message_templates = require('./templates'),
	fb_api = require('../api/fb');

/**
 * Parse ICM (Incoming Message) based on message item and depending on user current state.
 * Send relevant OGM (Outgoing Message).
 * @param user_id
 * @param message_item
 * @param user_object
 */
function parseICM(user_id, message_item, user_object) {
	var current_state = "welcome_message";
	if (user_object != null) {
		current_state = user_object.current_state;
	}
	// If we recieve any text message, parse and respond accordingly
	if (message_item.message && message_item.message.text) {
		// Currently support a static welcome message only
		fb_api.sendFacebookGenericMsg(user_id, message_templates.templates[current_state]);
	}
	// If the user clicked a button
	else if (message_item.postback && message_item.postback.payload) {
		var button_payload_state = message_item.postback.payload;
		switch (button_payload_state) {
			case "get_options":
				fb_api.sendFacebookGenericMsg(user_id, message_templates.templates["options_message"]);
				break;
			case "no_options":
				var response = "Ok. There is so much you can do with stateful bots!";
				fb_api.sendFacbookTextMsg(user_id, response);
				break;
		}
	}
	// Save new user state. If user does not exist in DB, will create a new user.
	user_models.set(user_id, {current_state: ""});
}

module.exports = {
	parseICM:parseICM
};