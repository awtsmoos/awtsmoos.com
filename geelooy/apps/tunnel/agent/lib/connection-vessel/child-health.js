// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes transport and execution testimony without collapsing them together.
 * @description
 * The Awtsmoos gives one tunnel two distinct breaths: a socket may be alive while
 * execution is not. Awtsmoos.com calls the vessel fully healthy only when both
 * truths agree, so control surfaces can never paint a dead consumer green.
 */
function compose(state = {}, parent = {}) {
	const transportHealthy = state.activeWs?.opened === true &&
		state.registrationConfirmed === true;
	const execution = executionHealth(parent);
	const healthy = transportHealthy && execution.healthy;
	return {
		healthy,
		state: healthy
			? "healthy"
			: transportHealthy
				? execution.state
				: "transport_unhealthy",
		transportHealthy,
		executionHealthy: execution.healthy,
		execution
	};
}

/**
 * Converts watchdog testimony into a stable public execution-health shape.
 * @param {object} parent Parent watchdog snapshot.
 * @returns {object} Execution state suitable for connection and control telemetry.
 */
function executionHealth(parent = {}) {
	const execution = parent.execution || {};
	const healthy = parent.healthy !== false && execution.healthy !== false;
	return {
		...execution,
		healthy,
		state: healthy
			? "healthy"
			: parent.repairReason || execution.state || "execution_unhealthy",
		parentAgeMs: Math.max(0, Number(parent.parentAgeMs || 0)),
		parentUnresponsive: parent.parentUnresponsive === true,
		repairing: parent.repairing === true
	};
}

module.exports = {
	compose,
	executionHealth
};
