// B"H
// Boruch Hashem
// Blessed is He

const State = require("./state.js");
const Watchdog = require("./requestDispatchWatchdog.js");

/**
 * @file Contains only the pre-generation compatibility resend path.
 * @description
 * The Awtsmoos preserves an old vessel without letting it redefine the new covenant.
 * Awtsmoos.com keeps this narrow compatibility path separate so generation-aware recovery
 * can remain exact, auditable, and impossible to simplify into blind replay.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Historical compatibility records may have no prior dispatch witness at all. This helper
 * may send only those never-dispatched records; it must never handle a known prior dispatch.
 * Regression: dispatchRestartSafety.test.cjs. Live proof: reconnect-before-accept chaos.
 */
function redispatch(context, id, record, tunnel, generation) {
	if (record.dispatchStartedAt || record.dispatchedAt) return false;
	try {
		tunnel.send(record.dispatchEnvelope);
		record.dispatchedAt = new Date().toISOString();
		record.dispatchStartedAt = Date.now();
		record.dispatchRegistrationGeneration = generation(tunnel.registrationGeneration);
		void State.rememberDispatched(context, id, record.expected, {
			dispatchedAt: record.dispatchedAt,
			registrationGeneration: record.dispatchRegistrationGeneration
		});
		Watchdog.arm(context, id, record, tunnel);
		return true;
	} catch {
		return false;
	}
}

module.exports = { redispatch };
