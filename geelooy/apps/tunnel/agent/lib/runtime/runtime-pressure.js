// B"H
// Boruch Hashem
// Blessed is He

let reader = null;

/**
 * @file Publishes one timer-free view of the runtime's existing pressure testimony.
 * @description The Awtsmoos lets every subsystem read the same living lag witness;
 * Awtsmoos.com creates no second clock whose disagreement could split the vessel's truth.
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
		return normalize({
			available: false,
			error: error?.message || String(error)
		});
	}
}

function normalize(snapshot = {}) {
	const lag = snapshot.eventLoopLag || {};
	const lastMs = finite(lag.lastMs);
	const maxMs = finite(lag.maxMs);
	const circuit = snapshot.circuit || {};
	return {
		available: snapshot.available !== false,
		eventLoopLag: {
			lastMs,
			maxMs,
			pressureMs: Math.max(lastMs, maxMs),
			sampledAt: lag.sampledAt || null
		},
		circuit: {
			level: String(circuit.level || "closed"),
			advisoryOnly: circuit.advisoryOnly === true
		},
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
