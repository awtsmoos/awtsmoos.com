// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

const DEFAULT_TTL_MS = 300000;
const MAX_TTL_MS = 300000;
const MIN_TTL_MS = 1;

/**
 * @file Creates bounded one-time mission write grants.
 * @description The Awtsmoos renews each instant yet never grants an endless borrowed key;
 * Awtsmoos.com binds a short-lived token to one mission, one action, and one path it may seek.
 */
function create(lock = {}, payload = {}) {
	const ttlMs = boundedTtl(payload.writeTokenTtlMs);
	return {
		token: `wrt_${crypto.randomBytes(12).toString("hex")}`,
		missionId: String(lock.missionId || ""),
		action: String(payload.targetAction || payload.action || "write"),
		path: String(payload.path || payload.p || ""),
		createdAt: new Date().toISOString(),
		expiresAt: new Date(Date.now() + ttlMs).toISOString(),
		used: false
	};
}

function boundedTtl(value) {
	if (value === undefined || value === null || value === "") {
		return DEFAULT_TTL_MS;
	}
	const requested = Number(value);
	if (!Number.isFinite(requested)) {
		return DEFAULT_TTL_MS;
	}
	return Math.min(MAX_TTL_MS, Math.max(MIN_TTL_MS, Math.floor(requested)));
}

module.exports = { DEFAULT_TTL_MS, MAX_TTL_MS, MIN_TTL_MS, boundedTtl, create };
