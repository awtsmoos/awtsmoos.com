// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./processIdentity.js");
const { getGlobalRegistry } = require("../../../lib/runtime/worker-supervisor.js");

/**
 * @file Proves whether current-process memory already owns a durable command.
 * @description
 * The Awtsmoos gives one worker one ending; Awtsmoos.com must never appoint a
 * detached monitor over a child whose live registry lease is still exact.
 */
function inspect(record = {}, options = {}) {
	if (record.currentRoot !== true) {
		return result(false, "not_current_root");
	}
	const meta = record.meta || {};
	const workerId = String(meta.workerId || "").trim();
	if (!workerId) {
		return result(false, "worker_id_missing");
	}
	const registry = options.registry || getGlobalRegistry();
	const active = registry.getWorker(workerId);
	if (!active) {
		return result(false, "worker_not_registered", { workerId });
	}
	const expected = Identity.fromMeta(meta);
	const observed = {
		...active,
		alive: true
	};
	const comparison = Identity.compare(expected, observed);
	if (!comparison.ok) {
		return result(false, "worker_registry_identity_mismatch", {
			workerId,
			active,
			comparison
		});
	}
	return result(true, "worker_registry_exact", {
		workerId,
		active,
		comparison
	});
}

function result(owned, reason, extra = {}) {
	return {
		owned,
		reason,
		...extra
	};
}

module.exports = {
	inspect
};
