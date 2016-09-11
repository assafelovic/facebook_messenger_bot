// Enter your templates and postbacks here for clarification of code
// Right now there are two examples here.
let templates = {
	"welcome_message": {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "button",
				"text": "Hello and welcome to your first bot. Would you like to get see our products?",
				"buttons": [
					{
						"type": "postback",
						"title": "Yes",
						"payload": "get_options"
					},
					{
						"type": "postback",
						"title": "No",
						"payload": "no_options"
					}
				]
			}
		}
	},
	"options_message": {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [
					{
					"title": "Option 1",
					"subtitle": "Amazon Echo",
					"image_url":"http://newswatchtv.com/wp-content/uploads/2015/11/Amazon-Echo.jpg"
					},
					{
						"title": "Option 2",
						"subtitle": "Nest protect",
						"image_url":"http://www.computerlegacy.com/wp-content/uploads/2015/08/nest_protect.jpg"
					},
					{
						"title": "Option 3",
						"subtitle": "Apple iWatch",
						"image_url":"http://i0.wp.com/www.thebinarytrend.com/wp-content/uploads/2015/03/Apple-Watch-logo-main1.png"
					}
				]
			}
		}
	}
};

module.exports = {
	templates: templates
};