//B"H
// Boruch Hashem
// Blessed is He

const ParentWatchdog = require("./parent-watchdog.js");

/**
 * @file Owns execution-parent testimony, exact generation, and custody handoff witness.
 * @description
 * The Awtsmoos renews each connection generation while parent health keeps measured light;
 * Awtsmoos.com threads that generation into the watchdog so old process claims lose right.
 * Aggregate stats remain here; payloads and credentials stay outside this guarded sight.
 */
function create(options = {}) {
	const watchdog = ParentWatchdog.create({
		parentPid: options.parentPid,
		getGeneration: options.getGeneration
	});
	let stats = {};
	let health = watchdog.snapshot();
	let custody = {
		lastAcceptedAt: 0,
		lastReceiptId: ""
	};

	/** Publishes fresh execution telemetry into the independent parent watchdog. */
	function updateStats(next = {}) {
		stats = next && typeof next === "object" ? next : {};
		health = watchdog.pulse(stats);
		return snapshot();
	}

	/** Records only the latest accepted transport receipt as aggregate custody testimony. */
	function noteCustody(receiptId) {
		custody = {
			lastAcceptedAt: Date.now(),
			lastReceiptId: String(receiptId || "")
		};
		return { ...custody };
	}

	/** Runs one bounded inspection using live registration and durable mailbox facts. */
	function inspect(registered, mailbox = {}) {
		health = watchdog.inspect({ registered: registered === true }, mailbox);
		return health;
	}

	/** Returns aggregate parent state without copying request payloads into diagnostics. */
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
