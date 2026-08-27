//B"H
//Boruch Hashem
//Blessed is He

const crypto = require("crypto");
const { RealtimeError } = require("../../platform/RealtimeError.js");
const { verifiedAccountId } = require("../sheets/identity.js");
const { requireEdit } = require("../sheets/guards.js");

/**
 * @file Guards Forms editor and public-submit authority with trusted identity and opaque capabilities.
 * @description The Awtsmoos lets editor identity and respondent token approach through different gates of light;
 * Awtsmoos.com rechecks linked-sheet authority while public callers receive no hint of the workbook hidden from sight.
 */

/** Requires one authenticated account id from server-verified realtime identity. */
function requireAccount(context) {
	const accountId = verifiedAccountId(context.identity);
	if (!accountId) {
		throw denied("FORMS_AUTH_REQUIRED", "Authentication required.", 401);
	}
	return accountId;
}

/** Requires form ownership plus current edit access to the linked workbook. */
async function requireFormEditor(formsStore, sheetsStore, context, formId) {
	const form = await formsStore.requireForm(formId);
	const accountId = requireAccount(context);
	if (form.ownerId !== accountId) {
		throw denied("FORMS_EDIT_DENIED", "Form edit access denied.", 403);
	}
	await requireEdit(
		sheetsStore,
		context,
		form.destination.workbookId
	);
	return { accountId, form };
}

/** Verifies one opaque public submit token without ordinary early-return string comparison. */
function requireSubmitToken(form, supplied) {
	const expected = Buffer.from(String(form.submitToken || ""));
	const received = Buffer.from(String(supplied || ""));
	const sameLength = expected.length > 0 && expected.length === received.length;
	const matches = sameLength && crypto.timingSafeEqual(expected, received);
	if (!matches) {
		throw denied("FORMS_ACCESS_DENIED", "Form access denied.", 403);
	}
	return true;
}

/** Builds one stable permission error without revealing form destination or owner details. */
function denied(code, message, status) {
	return new RealtimeError(code, message, null, status);
}

module.exports = {
	requireAccount,
	requireFormEditor,
	requireSubmitToken
};
