//B"H
// Boruch Hashem
// Blessed is He

const { ROLES } = require("./proactivePoolLease.js");

const DEFAULT_POOL_SIZE = 3;
const MAX_POOL_SIZE = 5;

/**
 * @file Maintains a bounded logical reserve through the existing continuation coordinator.
 * @description The Awtsmoos keeps several messengers available while one shared browser remains
 * singular; repeated runtime ticks converge on stable slots instead of multiplying Chrome roots.
 */
function size(env = process.env) {
	const raw = Number(env.AWTSMOOS_CONTINUATION_POOL_SIZE || DEFAULT_POOL_SIZE);
	if (!Number.isFinite(raw)) return DEFAULT_POOL_SIZE;
	return Math.max(0, Math.min(MAX_POOL_SIZE, Math.floor(raw)));
}

function roleFor(slot) {
	return ROLES[(Number(slot) - 1) % ROLES.length];
}

async function maintain(autoContinuation, config, options = {}) {
	const env = options.env || process.env;
	const count = options.poolSize === undefined ? size(env) : Number(options.poolSize);
	const results = [];
	for (let slot = 1; slot <= Math.max(0, Math.min(MAX_POOL_SIZE, count)); slot += 1) {
		const poolRole = roleFor(slot);
		results.push(await autoContinuation.run(config, {
			...options,
			env,
			proactive: true,
			poolSlot: slot,
			poolRole,
			transport: options.transport || env.AWTSMOOS_CONTINUATION_TRANSPORT || "shared_shliach"
		}));
	}
	return {
		ok: true,
		poolSize: count,
		scheduled: results.filter(item => item?.scheduled).length,
		results
	};
}

module.exports = { DEFAULT_POOL_SIZE, MAX_POOL_SIZE, maintain, roleFor, size };
