const express = require('express'),
    request = require('request'),
    user_models = require('../models/user');

// Your page token from Facebook developers site goes here
const FB_TOKEN = "<PAGE_TOKEN_GOES_HERE>";
// Create your own token or use the below. The token should be copied to Facebook Webhook init at developers page.
const WEBHOOK_TOKEN = "<WEBHOOK_VERIFY_TOKEN_GOES_HERE>";

// Get Facebook Graph API user basic profile info
function getFBInfo(user_id, callback) {
    request({
        url: `https://graph.facebook.com/v2.6/${user_id}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${FB_TOKEN}`,
        json:true,
        method : "GET"
    }, callback);
}

function facebookVerification(req, res) {
    if (req.query['hub.verify_token'] === WEBHOOK_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
    }
}

// Facebook webhook listener for Incoming msgs. This is where the ICMs arrive and parsed accordingly
function facebookWebhookListener(req, res) {
    if (!req.body || !req.body.entry[0] || !req.body.entry[0].messaging) {
        return console.error("no entries on received body");
    }
    let messaging_events = req.body.entry[0].messaging;
    for (let messagingItem of messaging_events) {
        let user_id = messagingItem.sender.id;
        user_models.get(user_id, messagingItem, parseICM);
    }
    res.sendStatus(200);
}

// Send text message
function sendFacbookTextMsg(user_id, text) {
    let messageData = { text:text };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: FB_TOKEN},
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
        qs: {access_token: FB_TOKEN},
        method: 'POST',
        json: {
            recipient: { id: user_id },
            message: message_template
        }
    }, facebookCallbackResponse);
}

function facebookCallbackResponse(error, response) {
    if (error) {
        console.log('Error sending messages: ', error)
    } else if (response.body.error) {
        console.log('Error: ', response.body.error)
    }
}

module.exports = {
    FB_TOKEN:FB_TOKEN,
    WEBHOOK_TOKEN:WEBHOOK_TOKEN,
    getFBInfo:getFBInfo,
    facebookVerification:facebookVerification,
    sendFacebookGenericMsg:sendFacebookGenericMsg,
    sendFacbookTextMsg:sendFacbookTextMsg,
    facebookWebhookListener:facebookWebhookListener
};