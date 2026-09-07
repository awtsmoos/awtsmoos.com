// B"H
// Boruch Hashem
// Blessed is He

const RECOVERY_CAPABILITY = "recoveryControlV1";
const STATUS_ACTION = "nativeGenerationStatus";
const MUTATION_ACTIONS = new Set(["nativeGenerationReplace", "nativeAgentRestart"]);

/**
 * @file Routes only verified native-generation recovery onto the independent control wire.
 * @description
 * The Awtsmoos reveals the child before replacing the child; Awtsmoos.com reads exact
 * supervisor and child PIDs, then echoes them back so one changed generation cannot inherit another's decree.
 */
function supports(device = {}, payload = {}, ws = {}) {
	const action = String(payload.action || "");
	return typeof ws.sendTunnelRecoveryControl === "function" &&
		device.capabilities?.[RECOVERY_CAPABILITY] === true &&
		(action === STATUS_ACTION || MUTATION_ACTIONS.has(action));
}

async function send(options = {}) {
	const { $i, accountId, routeReference, payload = {}, timeoutMs, device } = options;
	if (!supports(device, payload, $i?.ws)) return null;
	const action = String(payload.action || "");
	if (action === STATUS_ACTION) {
		return await control($i, accountId, routeReference, "generation_status", {}, timeoutMs);
	}
	const status = await control(
		$i,
		accountId,
		routeReference,
		"generation_status",
		{},
		timeoutMs
	);
	if (status?.ok !== true || status?.process?.ok !== true) {
		return failure("recovery_generation_status_unverified", status);
	}
	return await control($i, accountId, routeReference, "generation_replace", {
		expectedProcess: {
			supervisorPid: status.process.supervisorPid,
			childPid: status.process.childPid
		},
		reason: String(payload.reason || action),
		force: payload.force === true
	}, timeoutMs);
}

function control($i, accountId, routeReference, verb, payload, timeoutMs) {
	return $i.ws.sendTunnelRecoveryControl(
		accountId,
		routeReference,
		verb,
		payload,
		timeoutMs
	);
}

function failure(error, status) {
	return { ok: false, error, status };
}

module.exports = {
	MUTATION_ACTIONS,
	RECOVERY_CAPABILITY,
	STATUS_ACTION,
	send,
	supports
};
