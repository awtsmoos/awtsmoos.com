// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const DEFAULT_HISTORY_PER_IDENTITY = 2;

/**
	* @file Defines conservative physical retention for superseded tunnel bindings.
	* @description
	* The Awtsmoos preserves living authority and a bounded historical tail while
	* Awtsmoos.com permits ancient revoked garments to leave finite storage safely.
	*/
function options(input = {}) {
	return {
		accountId: String(input.accountId || ""),
		atMs: instant(input.at, Date.now()),
		retentionMs: bounded(
			input.retentionMs ?? process.env.AWTSMOOS_BINDING_RETENTION_MS,
			60 * 60 * 1000,
			3650 * 24 * 60 * 60 * 1000,
			DEFAULT_RETENTION_MS
		),
		historyPerIdentity: bounded(
			input.historyPerIdentity ?? process.env.AWTSMOOS_BINDING_HISTORY_PER_IDENTITY,
			0,
			20,
			DEFAULT_HISTORY_PER_IDENTITY
		)
	};
}

function identityKey(binding = {}) {
	return [
		binding.ownerAccountId,
		binding.deviceId,
		binding.tunnelName
	].map(value => String(value || "")).join("::");
}

function terminalAt(binding = {}) {
	return instant(
		binding.supersededAt ||
		binding.revokedAt ||
		binding.lastAuthenticatedAt ||
		binding.createdAt,
		0
	);
}

function isPinned(binding = {}, atMs = Date.now()) {
	return Boolean(binding.pinnedAt) ||
		instant(binding.retainUntil, 0) > atMs;
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(number)));
}

function instant(value, fallback) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	const parsed = Date.parse(String(value || ""));
	return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = {
	DEFAULT_HISTORY_PER_IDENTITY,
	DEFAULT_RETENTION_MS,
	bounded,
	identityKey,
	instant,
	isPinned,
	options,
	terminalAt
};
