const nodemailer = require('nodemailer');
const mustache = require('mustache');
const fs = require('fs');
const axios = require('axios');

const XSS_PAYLOAD_FIRE_EMAIL_TEMPLATE = fs.readFileSync(
	'./templates/xss_email_template.htm',
	'utf8'
);

async function send_email_notification(xss_payload_fire_data) {
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: parseInt(process.env.SMTP_PORT),
		secure: (process.env.SMTP_USE_TLS === "true"),
		auth: {
			user: process.env.SMTP_USERNAME,
			pass: process.env.SMTP_PASSWORD,
		},
	});

	const notification_html_email_body = mustache.render(
		XSS_PAYLOAD_FIRE_EMAIL_TEMPLATE, 
		xss_payload_fire_data
	);

	const info = await transporter.sendMail({
		from: process.env.SMTP_FROM_EMAIL,
		to: process.env.SMTP_RECEIVER_EMAIL,
		subject: `[XSS Hunter Express] XSS Payload Fired On ${xss_payload_fire_data.url}`,
		text: "Only HTML reports are available, please use an email client which supports this.",
		html: notification_html_email_body,
	});

	console.log("Discord notification sent: %s", info.messageId);
}

async function send_discord_notification(xss_payload_fire_data) {
	var discord_message = {
		username: process.env.DISCORD_USERNAME,
		avatar_url: "",
		content: `XSS Payload Fired On ${xss_payload_fire_data.url}`
	};

	await axios.post(process.env.DISCORD_WEBHOOK, JSON.stringify(discord_message));
}

module.exports.send_email_notification = send_email_notification;
module.exports.send_discord_notification = send_discord_notification;