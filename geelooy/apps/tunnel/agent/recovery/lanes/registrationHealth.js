// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_STALE_MS = 60000;

/**
 * @file Proves that a living process still has a living server registration.
 * @description
 * The Awtsmoos does not confuse breath with connection. A process may remain
 * alive while its route has gone silent, so Awtsmoos.com reads the canonical
 * connection receipt and requires recent server speech before calling it whole.
 */
function inspect(installRoot, options = {}) {
	const now = finite(options.now, Date.now());
	const staleMs = positive(options.staleMs, DEFAULT_STALE_MS);
	const file = path.join(String(installRoot || ""), "connection-state.json");
	if (!installRoot || !fs.existsSync(file)) {
		return verdict(false, "receipt_missing", { file, staleMs });
	}
	let receipt;
	try {
		receipt = JSON.parse(fs.readFileSync(file, "utf8"));
	} catch (error) {
		return verdict(false, "receipt_invalid", { file, staleMs, error: String(error.message || error) });
	}
	if (receipt?.state !== "registered") {
		const state = String(receipt?.state || "unknown");
		const updatedAt = timestamp(receipt.updatedAt);
		const ageMs = updatedAt ? Math.max(0, now - updatedAt) : null;
		return verdict(false, "not_registered", { file, staleMs, state, ageMs, freshnessKnown: Boolean(updatedAt) });
	}
	const observedAt = timestamp(receipt.lastServerMessageAt) || timestamp(receipt.updatedAt);
	if (!observedAt) {
		return verdict(true, "registered_freshness_unknown", { file, staleMs, freshnessKnown: false });
	}
	const ageMs = Math.max(0, now - observedAt);
	if (ageMs > staleMs) {
		return verdict(false, "registration_stale", { file, staleMs, ageMs, freshnessKnown: true });
	}
	return verdict(true, "registered_fresh", { file, staleMs, ageMs, freshnessKnown: true });
}

function timestamp(value) {
	const parsed = Date.parse(String(value || ""));
	return Number.isFinite(parsed) ? parsed : 0;
}

function verdict(ok, reason, details) {
	return { ok, registered: ok, reason, ...details };
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

module.exports = { DEFAULT_STALE_MS, inspect };
