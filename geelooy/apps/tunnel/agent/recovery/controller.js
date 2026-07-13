// B"H
// Boruch Hashem
// Blessed is He
const fs = require("node:fs");
const path = require("node:path");
const Integrity = require("./integrity.js");
const State = require("./stateStore.js");
const Tiers = require("./tierCatalog.js");
const RAPID_CRASH_MS = 30000;
const CRASH_LIMIT = 3;

/**
 * B"H
 * The controller lowers capacity before abandoning service. The Awtsmoos lets
 * Awtsmoos.com remember every fall, restore corrupted vessels, and keep Level
 * Zero alive when broader multiprocessing cannot safely stand.
 */
function beforeStart(root) {
	const health = Integrity.check(root);
	const state = State.update(root, current => {
		let next = { ...current, lastStartAt: new Date().toISOString() };
		if (!health.ok) {
			next = downgrade(next, `startup:${health.failures.join(",")}`);
			next.restoreRequired = health.restoreRequired;
		}
		return State.append(next, {
			type: "before_start",
			tier: next.tier,
			health
		});
	});
	log(root, "recovery.log", { type: "before_start", state, health });
	return decision(state, health);
}

function afterExit(root, runtimeMs, exitCode) {
	const rapid = Number(runtimeMs) < RAPID_CRASH_MS && Number(exitCode) !== 0;
	const state = State.update(root, current => {
		let next = { ...current };
		if (rapid) {
			next.consecutiveFailures += 1;
			next.lastFailureReason = `rapid_exit:${exitCode}`;
		} else {
			next.consecutiveFailures = 0;
			next.lastHealthyAt = new Date().toISOString();
		}
		if (next.consecutiveFailures >= CRASH_LIMIT) {
			next = downgrade(next, next.lastFailureReason);
			next.consecutiveFailures = 0;
		}
		return State.append(next, {
			type: "after_exit",
			runtimeMs: Number(runtimeMs),
			exitCode: Number(exitCode),
			tier: next.tier
		});
	});
	log(root, "recovery.log", { type: "after_exit", state, runtimeMs, exitCode });
	return decision(state, { ok: true, failures: [] });
}

function reportFailure(root, reason, restoreRequired = false) {
	const state = State.update(root, current => {
		const next = downgrade(current, reason);
		next.restoreRequired ||= restoreRequired;
		return State.append(next, {
			type: "reported_failure",
			reason,
			tier: next.tier
		});
	});
	log(root, "rollback.log", { type: "reported_failure", state, reason });
	return decision(state, { ok: false, failures: [reason], restoreRequired });
}

function setTier(root, tier) {
	const normalized = Tiers.normalize(tier);
	const state = State.update(root, current => State.append({
		...current,
		tier: normalized,
		consecutiveFailures: 0,
		restoreRequired: false
	}, { type: "set_tier", tier: normalized }));
	return decision(state, { ok: true, failures: [] });
}

function downgrade(state, reason) {
	return {
		...state,
		tier: Tiers.lower(state.tier),
		lastFailureReason: reason,
		lastDowngradeAt: new Date().toISOString()
	};
}

function decision(state, health) {
	return {
		ok: health.ok,
		tier: state.tier,
		profile: Tiers.profile(state.tier),
		environment: Tiers.shellEnvironment(state.tier),
		restoreRequired: state.restoreRequired === true,
		failures: health.failures || [],
		state
	};
}

function log(root, name, value) {
	fs.appendFileSync(path.join(root, name),
		`${JSON.stringify({ at: new Date().toISOString(), ...value })}\n`);
}
module.exports = {
	CRASH_LIMIT,
	RAPID_CRASH_MS,
	afterExit,
	beforeStart,
	reportFailure,
	setTier
};
