//B"H // Boruch Hashem // Blessed is He

const Values = require("./requestAcceptanceRecoveryValues.js");

const DEFAULT_MAX_RECOVERIES = 2;

/**
 * @file Retires one exact stale dispatch socket before the outer acceptance timeout becomes terminal.
 * @description The Awtsmoos keeps one deed while a transport vessel is exchanged. Awtsmoos.com
 * retires each registration generation at most once, preserves the pending record, and lets the
 * established newer-generation recovery path redeliver the same stored envelope and control identity.
 */
function request(context, id, record, tunnel, observedAt = Date.now()) {
	if (!eligible(context, id, record, tunnel)) return false;
	const attempts = count(record.preAcceptanceRecoveryAttempts);
	if (attempts >= DEFAULT_MAX_RECOVERIES) return false;
	const currentGeneration = generation(tunnel.registrationGeneration);
	const dispatchedGeneration = generation(record.dispatchRegistrationGeneration);
	const priorRecoveryGeneration = generation(record.preAcceptanceRecoveryGeneration);
	if (!currentGeneration || currentGeneration !== dispatchedGeneration) return false;
	if (priorRecoveryGeneration === currentGeneration) return false;

	try {
		tunnel.close(Values.CLOSE_CODE, Values.CLOSE_REASON);
	} catch {
		return false;
	}
	record.preAcceptanceRecoveryAttempts = attempts + 1;
	record.preAcceptanceRecoveryRequestedAt = observedAt;
	record.preAcceptanceRecoveryGeneration = currentGeneration;
	return true;
}

/** Accept only the still-owned unaccepted record on the same live route object. */
function eligible(context, id, record, tunnel) {
	return Boolean(
		tunnel && !record.requestAcceptedAt && !record.finalizationPromise &&
		context.pendingTunnelRequests?.get(id) === record &&
		context.tunnels?.get?.(record.registrationKey) === tunnel &&
		record.registrationKey === tunnel.registrationKey
	);
}

function generation(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function count(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

module.exports = {
	DEFAULT_MAX_RECOVERIES,
	count,
	eligible,
	generation,
	request
};
