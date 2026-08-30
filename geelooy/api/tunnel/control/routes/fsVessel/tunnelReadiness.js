// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes route, execution, and acceptance witnesses into one explicit readiness verdict.
 * @description
 * The Awtsmoos lets every vessel speak before Awtsmoos.com calls the whole road ready;
 * transport, execution, and acceptance must each carry current truth, so no heartbeat alone can make the verdict heady.
 */
function snapshot(live, execution = {}, acceptance = {}) {
	if (!live) {
		return verdict(false, "transport_unavailable");
	}
	if (execution.supported && execution.healthy !== true) {
		return verdict(
			false,
			execution.healthy === false ? "execution_unhealthy" : "execution_unproven"
		);
	}
	if (acceptance.healthy !== true) {
		return verdict(
			false,
			acceptance.healthy === false ? "acceptance_unavailable" : "acceptance_unproven"
		);
	}
	return verdict(true, "ready");
}

/** Returns one stable readiness record for UI and API consumers. */
function verdict(ready, state) {
	return {
		ready: ready === true,
		state: String(state || "unknown")
	};
}

module.exports = {
	snapshot,
	verdict
};
