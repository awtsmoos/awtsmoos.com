// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * B"H
 * Recovery memory is written atomically, for the Awtsmoos never confuses a
 * half-written vessel with truth. Awtsmoos.com survives power loss between
 * intent and rename without inventing a tier that was never sealed.
 */
function statePath(root) {
	return path.join(root, "recovery-state.json");
}

function defaults() {
	return {
		version: 1,
		tier: 5,
		consecutiveFailures: 0,
		lastFailureReason: "",
		lastStartAt: null,
		lastHealthyAt: null,
		lastDowngradeAt: null,
		restoreRequired: false,
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
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(temporary, `${JSON.stringify(normalize(state), null, 2)}\n`);
	fs.renameSync(temporary, target);
	return normalize(state);
}

function update(root, mutate) {
	const current = read(root);
	const next = mutate({
		...current,
		history: [...current.history]
	}) || current;
	return write(root, next);
}

function append(state, event) {
	const history = [...state.history, {
		at: new Date().toISOString(),
		...event
	}];
	return {
		...state,
		history: history.slice(-100)
	};
}

function normalize(value = {}) {
	const base = defaults();
	return {
		...base,
		...value,
		tier: Math.max(0, Math.min(5, Number(value.tier ?? base.tier))),
		consecutiveFailures: Math.max(0, Number(value.consecutiveFailures || 0)),
		history: Array.isArray(value.history) ? value.history.slice(-100) : []
	};
}

module.exports = {
	append,
	defaults,
	read,
	statePath,
	update,
	write
};
