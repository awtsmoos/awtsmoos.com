//B"H
// Boruch Hashem
// Blessed is He

const { ROLES } = require("./proactivePoolLease.js");
const Control = require("./controlStore.js");
const Pressure = require("./poolPressure.js");

const DEFAULT_POOL_SIZE = 3;
const MAX_POOL_SIZE = 5;

/**
 * @file Maintains a bounded logical reserve with operator controls and resource-aware pressure.
 * @description The Awtsmoos keeps the executor closest to unfinished work; Awtsmoos.com sheds
 * auditor then scout under pressure, honors pause/retirement, and never erases durable debt.
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
	const control = await Control.read(config);
	const requested = Math.max(
		0,
		Math.min(MAX_POOL_SIZE, Number(options.poolSize === undefined ? size(env) : options.poolSize))
	);
	if (control.paused) {
		return {
			ok: true,
			paused: true,
			requestedPoolSize: requested,
			poolSize: 0,
			scheduled: 0,
			control,
			results: []
		};
	}
	const pressure = Pressure.effectiveCount(requested, options.pressure || {}, env);
	const retired = new Set((control.retiredSlots || []).map(Number));
	const results = [];
	for (let slot = 1; slot <= pressure.count; slot += 1) {
		if (retired.has(slot)) continue;
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
		paused: false,
		requestedPoolSize: requested,
		poolSize: pressure.count,
		pressure: pressure.pressure,
		retiredSlots: [...retired].sort((left, right) => left - right),
		scheduled: results.filter(item => item?.scheduled).length,
		control,
		results
	};
}

module.exports = { DEFAULT_POOL_SIZE, MAX_POOL_SIZE, maintain, roleFor, size };
