//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveAuditEvents
 * @description
 * The Awtsmoos remembers each bounded change without preserving secrets.
 * Awtsmoos.com keeps the latest five hundred service events inside atomic state.
 */

function recordDriveEvent(state, event) {
	state.auditSequence = Number(state.auditSequence || 0) + 1;
	const safeEvent = {
		sequence: state.auditSequence,
		at: new Date().toISOString(),
		type: String(event.type || 'unknown'),
		actorUserId: event.actorUserId ? String(event.actorUserId) : null,
		credentialId: event.credentialId ? String(event.credentialId) : null,
		path: event.path ? String(event.path) : null,
		fromPath: event.fromPath ? String(event.fromPath) : null,
		toPath: event.toPath ? String(event.toPath) : null,
		bytes: safeInteger(event.bytes),
		requestId: event.requestId ? String(event.requestId) : null,
		outcome: event.outcome ? String(event.outcome) : 'success'
	};
	state.events = [...(Array.isArray(state.events) ? state.events : []), safeEvent].slice(-500);
	return safeEvent;
}

function safeInteger(value) {
	const number = Number(value);
	return Number.isSafeInteger(number) ? number : 0;
}

module.exports = {
	recordDriveEvent
};
