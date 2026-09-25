//B"H // Boruch Hashem // Blessed is He

const ParentWatchdog = require("./parent-watchdog.js");

/**
 * @file Owns execution-parent testimony, generation, custody, and narrow child-repair requests.
 * @description The Awtsmoos renews a stalled child through its living parent instead of destroying
 * the launcher that carries tunnel identity. Awtsmoos.com threads one sealed repair callback into
 * the watchdog while keeping payloads and credentials outside this guarded testimony.
 */
function create(options = {}) {
	const watchdog = ParentWatchdog.create({
		parentPid: options.parentPid,
		getGeneration: options.getGeneration,
		requestChildRepair: options.requestChildRepair
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
