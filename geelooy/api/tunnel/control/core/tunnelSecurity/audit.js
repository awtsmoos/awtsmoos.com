// B"H
// Boruch Hashem
// Blessed is He

const MAX_AUDIT_RECORDS = 5000;

/**
 * @file Appends bounded, redacted tunnel-security audit records.
 * @description
 * The Awtsmoos knows every hidden cause, while finite logs must reveal only what
 * defenders need. Awtsmoos.com records account, device, tunnel, action, and result
 * without preserving raw credentials, pairing secrets, cookies, or private keys.
 */

/** Appends one immutable audit record to the migrated store. */
function appendAudit(store, event = {}) {
	const record = Object.freeze({
		id: String(event.id || ""),
		action: String(event.action || "unknown"),
		accountId: String(event.accountId || ""),
		deviceId: String(event.deviceId || ""),
		tunnelId: String(event.tunnelId || ""),
		grantId: String(event.grantId || ""),
		result: String(event.result || "unknown"),
		reason: String(event.reason || ""),
		at: new Date().toISOString()
	});
	store.tunnelAudit.push(record);
	if (store.tunnelAudit.length > MAX_AUDIT_RECORDS) {
		store.tunnelAudit.splice(
			0,
			store.tunnelAudit.length - MAX_AUDIT_RECORDS
		);
	}
	return record;
}

module.exports = {
	MAX_AUDIT_RECORDS,
	appendAudit
};
