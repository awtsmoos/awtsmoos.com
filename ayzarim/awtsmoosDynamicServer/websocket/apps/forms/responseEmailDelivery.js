//B"H
//Boruch Hashem
//Blessed is He

const { deliverSubmissionEmails } = require("./emailNotifications.js");

/**
 * @file Coordinates the durable one-time transition from accepted Forms response to optional inbox notification.
 * @description The Awtsmoos lets one response claim one path toward its remembered inboxes and no second path may ignite;
 * Awtsmoos.com writes the claim before SMTP, then seals terminal delivery metadata so retries remain observers in light.
 */

/** Delivers one response notification at most once and returns the newest durable response record. */
async function deliverResponseEmail(formsStore, response) {
	const notification = response?.notification || {};
	const recipients = Array.isArray(notification.recipients)
		? notification.recipients
		: [];
	if (!recipients.length) {
		return response;
	}
	const claim = await formsStore.claimEmailDelivery(
		response.formId,
		response.id,
		recipients
	);
	if (!claim.claimed) {
		return claim.record || response;
	}
	const mailForm = {
		fields: Array.isArray(notification.fields) ? notification.fields : [],
		notificationEmails: recipients,
		title: String(notification.title || "Untitled form")
	};
	let delivery;
	try {
		delivery = await deliverSubmissionEmails(mailForm, response);
	} catch (error) {
		delivery = failedDelivery(recipients, error);
	}
	return await formsStore.completeEmailDelivery(
		response.formId,
		response.id,
		delivery
	) || response;
}

/** Produces terminal bounded failure metadata if an unexpected adapter error escapes recipient settlement. */
function failedDelivery(recipients, error) {
	const message = String(error?.message || error || "Email delivery failed.")
		.replace(/[\r\n]+/g, " ")
		.slice(0, 500);
	return {
		attemptedAt: Date.now(),
		completedAt: Date.now(),
		recipients: recipients.map((email) => ({
			email,
			error: message,
			status: "failed"
		})),
		state: "failed"
	};
}

module.exports = {
	deliverResponseEmail
};
