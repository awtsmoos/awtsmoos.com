// B"H
// Boruch Hashem
// Blessed is He

const Adaptive = require("./priority/adaptivePressurePolicy.js");
let reader = null;

/**
	* @file Publishes one timer-free pressure view plus a pure reversible bulk-pressure recommendation.
	* @description
	* The Awtsmoos lets every subsystem read one living lag witness and one advisory response;
	* Awtsmoos.com changes no p0 limits here, keeping observation separate from executional consequence.
	*/
function bind(nextReader) {
	if (typeof nextReader !== "function") throw new TypeError("runtime_pressure_reader_required");
	reader = nextReader;
	return nextReader;
}

function current() {
	if (!reader) return normalize({});
	try {
		return normalize(reader());
	} catch (error) {
		return normalize({ available: false, error: error?.message || String(error) });
	}
}

function normalize(snapshot = {}) {
	const lag = snapshot.eventLoopLag || {};
	const lastMs = finite(lag.lastMs);
	const maxMs = finite(lag.maxMs);
	const circuit = snapshot.circuit || {};
	const lanes = snapshot.lanes || {};
	const adaptive = Adaptive.recommend({
		lagMs: Math.max(lastMs, maxMs),
		circuitLevel: circuit.level,
		oldestBulkAgeMs: lanes.p4_bulk?.oldestQueuedAgeMs,
		recovering: snapshot.recovering === true
	}, snapshot.previousAdaptivePressure || {});
	return {
		available: snapshot.available !== false,
		eventLoopLag: { lastMs, maxMs, pressureMs: Math.max(lastMs, maxMs), sampledAt: lag.sampledAt || null },
		circuit: { level: String(circuit.level || "closed"), advisoryOnly: circuit.advisoryOnly === true },
		adaptive,
		observedAt: snapshot.observedAt || Date.now(),
		error: snapshot.error || ""
	};
}

function clear(expectedReader) {
	if (expectedReader && reader !== expectedReader) return false;
	reader = null;
	return true;
}

function finite(value) {
	const number = Number(value || 0);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = { bind, clear, current, normalize };
