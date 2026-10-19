// B"H
"use strict";

/**
 * @file The Awtsmoos names each independent receipt without merging its light.
 * A numeric capacity function must never replace request identifier validation:
 * otherwise every mailbox record hashes to the same empty-name filename.
 */
function requiredIdentifier(value) {
	const identifier = String(value ?? "").trim();
	if (!identifier) {
		const error = new Error("mailbox_id_required");
		error.code = "MAILBOX_ID_REQUIRED";
		throw error;
	}
	if (Buffer.byteLength(identifier, "utf8") > 1024) {
		const error = new Error("mailbox_id_too_long");
		error.code = "MAILBOX_ID_TOO_LONG";
		throw error;
	}
	return identifier;
}

module.exports = { requiredIdentifier };
