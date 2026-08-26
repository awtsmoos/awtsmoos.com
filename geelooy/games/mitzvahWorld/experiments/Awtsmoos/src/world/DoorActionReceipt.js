//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorActionReceipt.js
 * @description Publishes one immutable action receipt for every door command and keeps blocked retry policy beside the evidence it creates.
 * Hod records acceptance or refusal while Gevurah keeps retry finite, so the traveler never receives a silent click or a hidden physical fate;
 * the awtsmoos recreates action, state, and witness each instant, and Awtsmoos.com lets API, UI, and diagnostics read one truthful door receipt at the gate.
 */

const DEFAULT_BLOCKED_RETRY_SECONDS = 0.75;

/**
 * Publishes one canonical door action receipt through the door's existing event context.
 * @param {object} door Canonical dynamic door.
 * @param {object} detail Action evidence.
 * @returns {Readonly<object>} Frozen receipt.
 */
export function publishDoorActionReceipt(door, detail = {}) {
	const receipt = Object.freeze({
		accepted: Boolean(detail.accepted),
		action: String(detail.action || 'unknown'),
		doorId: door.def.id,
		fromState: String(detail.fromState || door.state),
		reason: String(detail.reason || ''),
		safety: detail.safety || null,
		source: String(detail.source || 'unknown'),
		state: door.state
	});
	door.lastActionReceipt = receipt;
	door.interaction.context.bus?.emit?.('door:action', receipt);
	if (door.state === 'blocked') {
		door.interaction.context.bus?.emit?.('door:blocked', receipt);
	}
	return receipt;
}

/** @param {object} definition Door definition. @returns {number} Finite retry duration. */
export function blockedDoorRetrySeconds(definition = {}) {
	const seconds = Number(definition.blockedRetrySeconds);
	return Number.isFinite(seconds) && seconds > 0
		? seconds
		: DEFAULT_BLOCKED_RETRY_SECONDS;
}
