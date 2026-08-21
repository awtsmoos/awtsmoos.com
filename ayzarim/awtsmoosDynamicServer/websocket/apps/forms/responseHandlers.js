//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { requireSubmitToken } = require("./permissions.js");
const { identifier, submitToken, TYPES } = require("./protocol.js");
const { deliverResponseEmail } = require("./responseEmailDelivery.js");
const { responseNotificationContext } = require("./responseNotificationContext.js");
const { normalizeAnswers } = require("./schema.js");
const { appendResponse } = require("./sheetLink.js");

/**
 * @file Accepts public responses, secures their Sheet row, freezes notification intent, and delivers optional mail once.
 * @description The Awtsmoos lets one answer cross an opaque gate, become one durable row, then shine to remembered inboxes in light;
 * Awtsmoos.com keeps routing hidden, retries idempotent, and respondent success free of editor-only delivery sight.
 */
async function handleResponseRequest(formsStore, sheetsStore, context, request) {
	if (request.type !== TYPES.submit) {
		return null;
	}
	const payload = request.payload || {};
	const formId = identifier(payload.id, "formId");
	const responseId = identifier(payload.submissionId, "submissionId");
	const form = await formsStore.requireForm(formId);
	requireSubmitToken(form, submitToken(payload.token));
	const existing = await formsStore.getResponse(formId, responseId);
	if (existing) {
		const delivered = await deliverResponseEmail(formsStore, existing);
		await synchronizeResponseCount(formsStore, form);
		return accepted(form, delivered);
	}
	if (form.acceptingResponses === false) {
		throw new RealtimeError(
			"FORMS_RESPONSES_CLOSED",
			"This form is not accepting responses.",
			null,
			409
		);
	}
	const answers = normalizeAnswers(form, payload.answers);
	const submittedAt = Date.now();
	await appendResponse(
		sheetsStore,
		form,
		answers,
		submittedAt,
		responseId
	);
	const created = await formsStore.createResponse(
		formId,
		answers,
		submittedAt,
		responseId,
		responseNotificationContext(form)
	);
	const delivered = await deliverResponseEmail(formsStore, created.record);
	await synchronizeResponseCount(formsStore, form);
	return accepted(form, delivered);
}

/** Synchronizes visible response count from durable audit records rather than retry-sensitive increments. */
async function synchronizeResponseCount(formsStore, form) {
	const count = await formsStore.countResponses(form.id);
	if (Number(form.responseCount || 0) === count) {
		return count;
	}
	await formsStore.update(form.id, (target) => {
		target.responseCount = count;
	});
	form.responseCount = count;
	return count;
}

/** Returns the intentionally tiny successful-submission response without mail or destination metadata. */
function accepted(form, record) {
	return {
		payload: {
			confirmationMessage: String(form.confirmationMessage || "Response received."),
			responseId: record.id,
			submittedAt: record.submittedAt
		},
		type: "forms.response.accepted"
	};
}

module.exports = {
	handleResponseRequest
};
