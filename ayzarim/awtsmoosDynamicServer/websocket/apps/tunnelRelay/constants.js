// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file constants.js
 * @description
 * The Awtsmoos gives every relay vessel a measured boundary while durable truth rests on disk.
 * Awtsmoos.com keeps fast mirrors small enough that remembering yesterday cannot consume today.
 */

const FOUR_MINUTES_MS = 240000;
const ONE_DAY_MS = 86400000;

/** Resolve one positive integer environment setting without accepting infinity or zero. */
function positiveInteger(name, fallback) {
	const value = Number(process.env[name]);
	if (!Number.isFinite(value) || value <= 0) return fallback;
	return Math.max(1, Math.floor(value));
}

const SAFE_RELAY_WAIT_MS = positiveInteger("AWTSMOOS_TUNNEL_RELAY_SAFE_WAIT_MS", 750);
const MAX_SAFE_RELAY_WAIT_MS = positiveInteger(
	"AWTSMOOS_TUNNEL_RELAY_MAX_SAFE_WAIT_MS",
	4000
);
const PENDING_TTL_MS = positiveInteger("AWTSMOOS_TUNNEL_PENDING_TTL_MS", ONE_DAY_MS);
const COMPLETED_LIMIT = positiveInteger("AWTSMOOS_TUNNEL_COMPLETED_LIMIT", 256);
const DURABLE_MIRROR_LIMIT = positiveInteger("AWTSMOOS_TUNNEL_DURABLE_MIRROR_LIMIT", 256);
const DURABLE_MIRROR_TTL_MS = positiveInteger(
	"AWTSMOOS_TUNNEL_DURABLE_MIRROR_TTL_MS",
	PENDING_TTL_MS
);
const QUARANTINE_LIMIT = positiveInteger("AWTSMOOS_TUNNEL_QUARANTINE_LIMIT", 1000);

module.exports = {
	COMPLETED_LIMIT,
	DURABLE_MIRROR_LIMIT,
	DURABLE_MIRROR_TTL_MS,
	FOUR_MINUTES_MS,
	MAX_SAFE_RELAY_WAIT_MS,
	ONE_DAY_MS,
	PENDING_TTL_MS,
	QUARANTINE_LIMIT,
	SAFE_RELAY_WAIT_MS,
	positiveInteger
};
