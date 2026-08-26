//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hard resource ceilings for the Awtsmoos Device Protocol.
 * @description
 * The Awtsmoos is without measure, yet created stores require measured vessels.
 * Awtsmoos.com bounds time, text, payload, mailbox, and global message testimony
 * so generous communication never becomes accidental memory exhaustion in rhyme.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const LIMIT = Object.freeze({
	INVITATION_DEFAULT_TTL_MS: DAY,
	INVITATION_MAX_TTL_MS: 30 * DAY,
	RELATIONSHIP_DEFAULT_TTL_MS: 7 * DAY,
	RELATIONSHIP_MAX_TTL_MS: 90 * DAY,
	MESSAGE_DEFAULT_TTL_MS: DAY,
	MESSAGE_MAX_TTL_MS: 7 * DAY,
	MAX_PAYLOAD_BYTES: 16 * 1024,
	MAX_TOPIC_CHARS: 120,
	MAX_MESSAGES_PER_MAILBOX: 64,
	MAX_MESSAGES_GLOBAL: 512,
	MAX_INVITATIONS: 4096,
	MAX_RELATIONSHIPS: 4096,
	MAX_AUDIT_RECORDS: 5000
});

/** Clamps an untrusted duration into a finite positive lifetime. */
function ttlMs(value, fallback, maximum) {
	const numeric = Number(value);
	if (!Number.isFinite(numeric) || numeric <= 0) {
		return fallback;
	}
	return Math.min(Math.floor(numeric), maximum);
}

/** Builds an ISO expiry from one bounded duration. */
function expiresAt(value, fallback, maximum, now = Date.now()) {
	return new Date(now + ttlMs(value, fallback, maximum)).toISOString();
}

/** Measures JSON payload bytes without accepting unserializable values. */
function payloadBytes(payload) {
	try {
		return Buffer.byteLength(JSON.stringify(payload), "utf8");
	} catch {
		return Number.POSITIVE_INFINITY;
	}
}

/** Returns a bounded topic or an empty string for invalid input. */
function topic(value) {
	const text = String(value || "").trim();
	return text.length <= LIMIT.MAX_TOPIC_CHARS ? text : "";
}

/** Returns true when an ISO timestamp has passed. */
function isExpired(value, now = Date.now()) {
	const instant = Date.parse(String(value || ""));
	return Number.isFinite(instant) && instant <= now;
}

module.exports = {
	DAY,
	HOUR,
	LIMIT,
	expiresAt,
	isExpired,
	payloadBytes,
	topic,
	ttlMs
};
