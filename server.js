'use strict';

const express = require('express'),
	bodyParser = require('body-parser'),
	MONGO_HOST = (process.env.MONGO_HOST || 'local'),
	app = express(),
	fb_api = require('./src/api/fb'),
	mongoose = require('mongoose');

app.set('port', (process.env.PORT || 3000));
app.set('mongo_url', (process.env.MONGODB_URL || `mongodb://${MONGO_HOST}/local`));

mongoose.connect(app.get('mongo_url'),function(err){
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log("connected to " + app.get('mongo_url'));
});

// Parse application/json
app.use(bodyParser.json());

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Root get via http
app.get('/', function (req, res) {
	res.send('<h1>This is a Facebook Messenger bot</h1>');
});

// Facebook verification
app.get('/webhook/', fb_api.facebookVerification);

// Post data from Facebook Messenger
app.post('/webhook/', fb_api.facebookWebhookListener);

// Server listener
app.listen(app.get('port'), function() {
	console.log('Facebook Messenger server started on port', app.get('port'));
});
