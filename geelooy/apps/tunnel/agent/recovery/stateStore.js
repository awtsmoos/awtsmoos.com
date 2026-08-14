// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Persists recovery truth atomically outside ephemeral process memory.
 * The Awtsmoos remembers crash, registration, identity, and restoration as one scroll.
 */
function statePath(root) {
	return path.join(root, "recovery-state.json");
}

function defaults() {
	return {
		version: 2,
		tier: 5,
		consecutiveFailures: 0,
		registrationFailures: 0,
		restoreEligibleRegistrationFailures: 0,
		lastFailureKind: "",
		lastFailureReason: "",
		lastStartAt: null,
		lastHealthyAt: null,
		lastDowngradeAt: null,
		lastRegistrationFailureAt: null,
		identityInspectionRequired: false,
		identityResetRequired: false,
		identityRepairReason: "",
		identityRepairAttempts: 0,
		lastIdentityRepairAt: null,
		lastIdentityRepairState: "",
		restoreRequired: false,
		restoreReason: "",
		history: []
	};
}

function read(root) {
	try {
		return normalize(JSON.parse(fs.readFileSync(statePath(root), "utf8")));
	} catch {
		return defaults();
	}
}

function write(root, state) {
	const target = statePath(root);
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
	fs.writeFileSync(temporary, `${JSON.stringify(normalize(state), null, 2)}\n`, {
		mode: 0o600
	});
	fs.renameSync(temporary, target);
	return normalize(state);
}

function update(root, mutate) {
	const current = read(root);
	const next = mutate({ ...current, history: [...current.history] }) || current;
	return write(root, next);
}

function append(state, event) {
	const history = [...state.history, {
		at: new Date().toISOString(),
		...event
	}];
	return { ...state, history: history.slice(-100) };
}

function normalize(value = {}) {
	const base = defaults();
	return {
		...base,
		...value,
		version: 2,
		tier: Math.max(0, Math.min(5, Number(value.tier ?? base.tier))),
		consecutiveFailures: count(value.consecutiveFailures),
		registrationFailures: count(value.registrationFailures),
		restoreEligibleRegistrationFailures: count(
			value.restoreEligibleRegistrationFailures
		),
		identityRepairAttempts: count(value.identityRepairAttempts),
		history: Array.isArray(value.history) ? value.history.slice(-100) : []
	};
}

function count(value) {
	return Math.max(0, Number(value || 0));
}

module.exports = { append, defaults, read, statePath, update, write };
