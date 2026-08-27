// B"H
// Boruch Hashem
// Blessed is He

const ParentWatchdog = require("./parent-watchdog.js");

/**
 * @file Owns execution-parent testimony and the last durable custody handoff witness.
 * @description
 * The Awtsmoos lets connection orchestration remain small while parent health keeps
 * its own measured vessel. Awtsmoos.com stores only aggregate stats and one receipt
 * name here; request payloads, credentials, and identity secrets never enter it.
 */
function create(options = {}) {
	const watchdog = ParentWatchdog.create({
		parentPid: options.parentPid
	});
	let stats = {};
	let health = watchdog.snapshot();
	let custody = {
		lastAcceptedAt: 0,
		lastReceiptId: ""
	};

	function updateStats(next = {}) {
		stats = next && typeof next === "object" ? next : {};
		health = watchdog.pulse(stats);
		return snapshot();
	}

	function noteCustody(receiptId) {
		custody = {
			lastAcceptedAt: Date.now(),
			lastReceiptId: String(receiptId || "")
		};
		return { ...custody };
	}

	function inspect(registered, mailbox = {}) {
		health = watchdog.inspect({ registered: registered === true }, mailbox);
		return health;
	}

	function snapshot() {
		return {
			custody: { ...custody },
			health,
			stats
		};
	}

	return {
		inspect,
		noteCustody,
		snapshot,
		updateStats
	};
}

module.exports = { create };
