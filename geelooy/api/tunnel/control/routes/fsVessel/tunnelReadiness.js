// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Separates strict certification from present operational routing readiness.
 * @description
 * The Awtsmoos lets Awtsmoos.com keep two honest witnesses: `ready` means transport,
 * execution, and fresh acceptance are all proved now; `operationalReady` means the road
 * is live and no fresh execution or acceptance failure forbids using it as warm insurance.
 */
function snapshot(live, execution = {}, acceptance = {}) {
	const certification = certifiedVerdict(live, execution, acceptance);
	const operational = operationalVerdict(live, execution, acceptance);
	return {
		...certification,
		operationalReady: operational.ready,
		operationalState: operational.state
	};
}

/** Keeps the original strict certification covenant unchanged. */
function certifiedVerdict(live, execution, acceptance) {
	if (!live) return verdict(false, "transport_unavailable");
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

/** Authorizes routing while rejecting only current explicit inner failures. */
function operationalVerdict(live, execution, acceptance) {
	if (!live) return verdict(false, "transport_unavailable");
	if (execution.supported && execution.healthy === false) {
		return verdict(false, "execution_unhealthy");
	}
	if (acceptance.supported && acceptance.fresh === true && acceptance.healthy === false) {
		return verdict(false, "acceptance_unavailable");
	}
	if (acceptance.healthy !== true) {
		return verdict(true, "operational_acceptance_unproven");
	}
	if (execution.supported && execution.healthy !== true) {
		return verdict(true, "operational_execution_unproven");
	}
	return verdict(true, "operational_ready");
}

function verdict(ready, state) {
	return {
		ready: ready === true,
		state: String(state || "unknown")
	};
}

module.exports = {
	certifiedVerdict,
	operationalVerdict,
	snapshot,
	verdict
};
