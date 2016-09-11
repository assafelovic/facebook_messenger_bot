'use strict'

const express = require('express');
const request = require('request');
const db_utils = require('./db_utils.js');
const message_templates = require('./message_templates.js');

// Your page token from Facebook developers site goes here
const TOKEN = "EAAG4ofsU7L0BAIEHFLQlRNCqdWcZAVs74PNSnJjtYxLsQvpqPZAVpqChzEAWjI4LFLCMQZByk3c8lCN87eB499TNNINgpC8VLLxRvb6cwwDHr4SC2RGF4CVty0FgaHgPA7aelUq7ZAxJ7yDgn6lQY1OFLS8kYvrPsi43MweNZAAZDZD";
// Create your own token or use the below. The token should be copied to Facebook Webhook init at developers page.
const WEBHOOK_TOKEN = 'verify_me_as_facebook_messenger_bot'

function facebookVerification(req, res) {
	if (req.query['hub.verify_token'] === WEBHOOK_TOKEN) {
		res.send(req.query['hub.challenge']);
	}
	res.send('Error, wrong token');
}

// Facebook webhook listener for Incoming msgs. This is where the ICMs arrive and parsed accordingly
function facebookWebhookListener(req, res) {
	console.log("Got ICM");
	if (!req.body || !req.body.entry[0] || !req.body.entry[0].messaging) return console.error("no entries on received body");
	let messaging_events = req.body.entry[0].messaging;
	for (let messagingItem of messaging_events) {
		let user_id = messagingItem.sender.id;
		db_utils.getUserById(user_id, messagingItem, parseIncomingMSGSession);
	}
	res.sendStatus(200);
}

// Send text message
function sendFacbookTextMsg(user_id, text) {
	let messageData = { text:text };
	
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:TOKEN},
		method: 'POST',
		json: {
			recipient: {
				id:user_id
			},
			message: messageData
		}
	}, facebookCallbackResponse);
}

// Send generic template msg (could be options, images, etc.)
function sendFacebookGenericMsg(user_id, message_template) {
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token: TOKEN},
		method: 'POST',
		json: {
			recipient: { id: user_id },
			message: message_template
		}
	}, facebookCallbackResponse);
}

function facebookCallbackResponse(error, response, body) {
	if (error) {
		console.log('Error sending messages: ', error)
	} else if (response.body.error) {
		console.log('Error: ', response.body.error)
	}
}

/**
 * Parse ICM based on user postback, and depending on user current state. Send relevant OGM
 * @param user_id
 * @param messageItem
 * @param userObj
 */
function parseIncomingMSGSession(user_id, messageItem, userObj) {
	var current_state = "welcome_message";
	if (userObj != null) {
		current_state = userObj.current_state;
	}
	// If we recieve any text message, parse and respond accordingly
	if (messageItem.message && messageItem.message.text) {
		// Currently support a static welcome message only
		sendFacebookGenericMsg(user_id, message_templates.templates["welcome_message"]);
	}
	// If the user sends us a button click
	if (messageItem.postback && messageItem.postback.payload) {
		var button_payload_state = messageItem.postback.payload;
		switch (button_payload_state) {
			case "get_options":
				sendFacebookGenericMsg(user_id, message_templates.templates["options_message"]);
				break;
			case "no_options":
				sendFacbookTextMsg(user_id, "Ok. There is so much you can do with stateful bots!");
				break;
		}
	}
	// Save new user state. If user does not exist in DB, will create a new user.
	db_utils.setUserFieldById(user_id, "current_state", "");
}

module.exports = {
	sendFacbookTextMsg:sendFacbookTextMsg,
	sendFacebookGenericMsg:sendFacebookGenericMsg,
	facebookVerification:facebookVerification,
	facebookWebhookListener:facebookWebhookListener
};