//B"H
//Boruch Hashem
//Blessed is He

const AwtsmoosEmailClient = require("../../../../email/awtsmoosEmailClient.js");
const {
	notificationBody,
	notificationSubject
} = require("./emailNotificationBody.js");

/**
 * @file Delivers accepted Forms responses through the canonical Awtsmoos direct-MX/DKIM mail transport.
 * @description The Awtsmoos lets one durable response shine toward several chosen inboxes without confusing mail with storage light;
 * Awtsmoos.com records each independent delivery result so partial failure stays visible, bounded, and right.
 */
const SENDER = "forms@awtsmoos.com";

/** Attempts one notification per editor-configured recipient and returns bounded durable result metadata. */
async function deliverSubmissionEmails(form, response) {
	const recipients = Array.isArray(form.notificationEmails)
		? form.notificationEmails
		: [];
	const attemptedAt = Date.now();
	const settled = await Promise.allSettled(
		recipients.map((recipient) => sendOne(recipient, form, response))
	);
	const results = settled.map((result, index) => result.status === "fulfilled"
		? { email: recipients[index], status: "sent" }
		: {
			email: recipients[index],
			error: cleanError(result.reason),
			status: "failed"
		}
	);
	const sentCount = results.filter((result) => result.status === "sent").length;
	return {
		attemptedAt,
		completedAt: Date.now(),
		recipients: results,
		state: deliveryState(sentCount, results.length)
	};
}

/** Sends one plain-text message through a fresh transport instance. */
async function sendOne(recipient, form, response) {
	const client = new AwtsmoosEmailClient();
	await client.sendMail(
		SENDER,
		recipient,
		notificationSubject(form),
		notificationBody(form, response),
		{ "Content-Type": "text/plain; charset=utf-8" }
	);
}

/** Reduces independent recipient results into one durable overall state. */
function deliveryState(sentCount, total) {
	if (!total || sentCount === total) {
		return "sent";
	}
	return sentCount > 0 ? "partial" : "failed";
}

/** Bounds SMTP/provider errors before they enter the durable response audit. */
function cleanError(error) {
	return String(error?.message || error || "Email delivery failed.")
		.replace(/[\r\n]+/g, " ")
		.slice(0, 500);
}

module.exports = {
	deliverSubmissionEmails
};
