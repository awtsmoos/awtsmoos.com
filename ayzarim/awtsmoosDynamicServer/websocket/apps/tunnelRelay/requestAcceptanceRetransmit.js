//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Retransmits one immutable pre-acceptance envelope on its exact live route.
 * @description
 * The Awtsmoos renews every instant without multiplying the deed; Awtsmoos.com therefore
 * repeats only the identical durable request while custody is still unproven. The same
 * registration key, generation, transport receipt, and envelope remain one vessel, one rhyme:
 * if a frame was lost, resend in time; if custody was gained, never duplicate the climb.
 */

const DEFAULT_DELAY_MS = Number(
	process.env.AWTSMOOS_TUNNEL_ACCEPTANCE_RETRANSMIT_MS || 250
);
const DEFAULT_MAX_ATTEMPTS = Number(
	process.env.AWTSMOOS_TUNNEL_ACCEPTANCE_RETRANSMIT_ATTEMPTS || 2
);

/**
 * Arms bounded exact-envelope retransmission before destructive socket recovery.
 * @param {object} context Relay state containing current tunnels and pending requests.
 * @param {string} id Immutable transport receipt ID.
 * @param {object} record Durable pending-request record.
 * @param {object} tunnel Exact socket selected for the original dispatch.
 * @returns {boolean} Whether a retransmission timer was armed.
 */
function arm(context, id, record, tunnel) {
	clearTimeout(record.acceptanceRetransmitTimer);
	record.acceptanceRetransmitTimer = null;
	if (!eligible(context, id, record, tunnel)) return false;
	const delayMs = boundedDelay(DEFAULT_DELAY_MS);
	record.acceptanceRetransmitTimer = setTimeout(() => {
		record.acceptanceRetransmitTimer = null;
		attempt(context, id, record, tunnel, delayMs);
	}, delayMs);
	record.acceptanceRetransmitTimer.unref?.();
	return true;
}

/** Sends the exact stored envelope again only while route identity is unchanged. */
function attempt(context, id, record, tunnel, delayMs = boundedDelay(DEFAULT_DELAY_MS)) {
	if (!eligible(context, id, record, tunnel)) return false;
	const attempts = Number(record.acceptanceRetransmitAttempts || 0);
	if (attempts >= boundedAttempts(DEFAULT_MAX_ATTEMPTS)) return false;
	record.acceptanceRetransmitAttempts = attempts + 1;
	record.acceptanceRetransmitAt = Date.now();
	try {
		tunnel.send(record.dispatchEnvelope);
	} catch (error) {
		record.acceptanceRetransmitError = String(error?.message || error || "send_failed");
	}
	if (record.acceptanceRetransmitAttempts < boundedAttempts(DEFAULT_MAX_ATTEMPTS)) {
		record.acceptanceRetransmitTimer = setTimeout(() => {
			record.acceptanceRetransmitTimer = null;
			attempt(context, id, record, tunnel, delayMs * 2);
		}, delayMs * 2);
		record.acceptanceRetransmitTimer.unref?.();
	}
	return true;
}

/** Proves retransmission is still confined to the original live route generation. */
function eligible(context, id, record, tunnel) {
	if (!context || !record || !tunnel || record.requestAcceptedAt || record.finalizationPromise) return false;
	if (context.pendingTunnelRequests?.get(id) !== record) return false;
	if (context.tunnels?.get(record.registrationKey) !== tunnel) return false;
	if (tunnel.registrationKey !== record.registrationKey) return false;
	return Number(tunnel.registrationGeneration || 0) ===
		Number(record.dispatchRegistrationGeneration || 0) &&
		typeof tunnel.send === "function" && Boolean(record.dispatchEnvelope);
}

function boundedDelay(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(100, Math.min(2000, Math.floor(number))) : 250;
}

function boundedAttempts(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(1, Math.min(3, Math.floor(number))) : 2;
}

module.exports = {
	DEFAULT_DELAY_MS,
	DEFAULT_MAX_ATTEMPTS,
	arm,
	attempt,
	boundedAttempts,
	boundedDelay,
	eligible
};
