//B"H
// Boruch Hashem
// Blessed is He

const { LIMIT } = require("./limits.js");

/**
 * @file Bounded redacted audit testimony for cross-device consent and delivery.
 * @description
 * The Awtsmoos knows payload and intention completely, while Awtsmoos.com records
 * only the security-bearing outline: who acted, which covenant moved, and whether
 * the gate allowed or denied it, never copying message contents into logs in rhyme.
 */

/** Appends one payload-free protocol audit record. */
function appendAudit(store, event = {}) {
	store.deviceProtocolAudit = Array.isArray(store.deviceProtocolAudit)
		? store.deviceProtocolAudit
		: [];
	const record = Object.freeze({
		id: String(event.id || ""),
		action: String(event.action || "unknown"),
		accountId: String(event.accountId || ""),
		invitationId: String(event.invitationId || ""),
		relationshipId: String(event.relationshipId || ""),
		messageId: String(event.messageId || ""),
		sourceDeviceId: String(event.sourceDeviceId || ""),
		targetDeviceId: String(event.targetDeviceId || ""),
		result: String(event.result || "unknown"),
		reason: String(event.reason || ""),
		at: new Date().toISOString()
	});
	store.deviceProtocolAudit.push(record);
	const overflow = store.deviceProtocolAudit.length - LIMIT.MAX_AUDIT_RECORDS;
	if (overflow > 0) {
		store.deviceProtocolAudit.splice(0, overflow);
	}
	return record;
}

module.exports = { appendAudit };
