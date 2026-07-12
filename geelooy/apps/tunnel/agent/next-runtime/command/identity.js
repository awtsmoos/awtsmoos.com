// B"H
const crypto = require("node:crypto");

/**
 * B"H — A command and a process each receive a stable name. The hash prevents
 * one idempotency key from spawning two different intentions, while the birth
 * token prevents a recycled PID from receiving another command's signal.
 */
function commandIdentity(input = {}) {
	const canonical = canonicalString({
		command: String(input.command || ""),
		cwd: String(input.cwd || ""),
		shell: String(input.shell || ""),
		environmentHash: String(input.environmentHash || "")
	});
	return {
		idempotencyKey: clean(input.idempotencyKey),
		commandHash: crypto.createHash("sha256").update(canonical).digest("hex"),
		canonical
	};
}

function processIdentity(input = {}) {
	return {
		pid: positiveInteger(input.pid),
		processGroupId: positiveInteger(input.processGroupId || input.pgid),
		birthToken: clean(input.birthToken),
		platform: clean(input.platform || process.platform),
		observedAt: input.observedAt || new Date().toISOString()
	};
}

function compareProcess(expected = {}, observed = {}) {
	const wanted = processIdentity(expected);
	const actual = processIdentity(observed);
	if (observed.alive === false || !actual.pid) return { ok: false, state: "dead", expected: wanted, observed: actual };
	if (!wanted.pid || wanted.pid !== actual.pid) return mismatch("pid_mismatch", wanted, actual);
	if (!wanted.birthToken || !actual.birthToken) return { ok: false, state: "unverified", expected: wanted, observed: actual };
	if (wanted.birthToken !== actual.birthToken) return mismatch("birth_token_mismatch", wanted, actual);
	if (wanted.processGroupId && actual.processGroupId && wanted.processGroupId !== actual.processGroupId) {
		return mismatch("process_group_mismatch", wanted, actual);
	}
	return { ok: true, state: "exact", expected: wanted, observed: actual };
}

function sameCommand(existing = {}, incoming = {}) {
	const left = String(existing.commandHash || commandIdentity(existing).commandHash);
	const right = String(incoming.commandHash || commandIdentity(incoming).commandHash);
	return left === right;
}

function canonicalString(value) {
	return JSON.stringify(sortValue(value));
}

function sortValue(value) {
	if (Array.isArray(value)) return value.map(sortValue);
	if (!value || typeof value !== "object") return value;
	return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortValue(value[key])]));
}

function mismatch(reason, expected, observed) {
	return { ok: false, state: "mismatch", reason, expected, observed };
}

function clean(value) {
	return String(value || "").trim();
}

function positiveInteger(value) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0 ? number : null;
}

module.exports = { commandIdentity, compareProcess, processIdentity, sameCommand };
