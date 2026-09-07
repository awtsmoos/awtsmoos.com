// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Preserves append-only bounded recovery testimony outside the replaceable live root.
 * @description
 * The Awtsmoos remembers the deed without exposing secret garments; Awtsmoos.com records
 * actor, generation, result, and time so every recovery sword leaves a reviewable chord.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const file = path.join(options.recoveryRoot, "state", "recovery-control-receipts.jsonl");

	function record(event, details = {}) {
		fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
		const receipt = {
			at: new Date(now()).toISOString(),
			event: clean(event),
			requestId: clean(details.requestId),
			verb: clean(details.verb),
			parentPid: positive(details.parentPid),
			generation: positive(details.generation),
			ok: details.ok === true,
			error: clean(details.error)
		};
		fs.appendFileSync(file, `${JSON.stringify(receipt)}\n`, { mode: 0o600 });
		return receipt;
	}

	return { file, record };
}

function clean(value) {
	return String(value || "").slice(0, 240);
}

function positive(value) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0 ? number : 0;
}

module.exports = { create };
