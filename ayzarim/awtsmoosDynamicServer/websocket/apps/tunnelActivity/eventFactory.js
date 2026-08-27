// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const { redact } = require("./redaction.js");

/**
 * @file Creates the canonical account-bound activity event record.
 * @description
 * The Awtsmoos creates actor, deed, room, and observer in one instant, while
 * Awtsmoos.com records their finite relationship through explicit identifiers.
 * No event exists without an authoritative account vessel and bounded detail.
 */

const IDENTIFIER = /^[A-Za-z0-9._:@-]{1,180}$/;
const EVENT_TYPE = /^[a-z][a-z0-9._-]{1,95}$/;

/** Returns one bounded identifier or an empty string. */
function identifier(value) {
	const normalized = String(value || "").trim();
	return IDENTIFIER.test(normalized) ? normalized : "";
}

/** Creates an immutable event after redacting its detail payload. */
function createEvent(input = {}, sequence, now = Date.now()) {
	const accountId = identifier(input.accountId);
	const eventType = String(input.eventType || "activity.unknown");
	if (!accountId || !EVENT_TYPE.test(eventType)) {
		throw new Error("invalid_activity_identity");
	}
	const safe = redact(input.detail || {});
	return Object.freeze({
		protocolVersion: 1,
		eventId: identifier(input.eventId) || crypto.randomUUID(),
		eventType,
		sequence,
		timestamp: new Date(now).toISOString(),
		accountId,
		userId: identifier(input.userId),
		sessionId: identifier(input.sessionId),
		connectionId: identifier(input.connectionId),
		deviceId: identifier(input.deviceId),
		tunnelId: identifier(input.tunnelId),
		tunnelName: identifier(input.tunnelName),
		missionId: identifier(input.missionId),
		roomId: identifier(input.roomId),
		agentId: identifier(input.agentId),
		actionId: identifier(input.actionId),
		requestId: identifier(input.requestId),
		correlationId: identifier(input.correlationId),
		grantId: identifier(input.grantId),
		permissionVersion: Number(input.permissionVersion || 1),
		revocationVersion: Number(input.revocationVersion || 1),
		severity: severity(input.severity),
		state: String(input.state || "observed").slice(0, 80),
		summary: String(input.summary || eventType).slice(0, 320),
		detail: safe.value,
		truncated: safe.truncated
	});
}

function severity(value) {
	const normalized = String(value || "info").toLowerCase();
	return ["debug", "info", "notice", "warning", "error", "critical"]
		.includes(normalized)
		? normalized
		: "info";
}

module.exports = {
	createEvent,
	identifier,
	severity
};
