//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorActionReceipt.js
 * @description Creates and publishes immutable command evidence so UI, API, diagnostics, and gameplay observers receive the same accepted/refused doorway truth.
 * Hod remembers the command while Gevurah bounds blocked retry, yet neither witness invents state beyond the living threshold in sight;
 * the Awtsmoos recreates action, reason, and observer each instant, and Awtsmoos.com lets every surface read one luminous receipt without hidden blight.
 */

const DEFAULT_BLOCKED_RETRY_SECONDS = 0.75;

/**
 * @description Builds one normalized immutable command receipt, stores it on the door for diagnostics, and publishes canonical action/blockage events through the installed bus.
 * @param {object} door Canonical dynamic door containing immutable definition identity, current state, interaction context, and last-receipt storage.
 * @param {object} detail Command evidence containing accepted, action, fromState, reason, safety, and source fields.
 * @returns {Readonly<object>} Immutable canonical command receipt shared by gameplay, public API, UI feedback, and diagnostics.
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

/**
 * @description Normalizes authored blocked-close retry metadata into one positive finite duration so safe-close retries never become zero, negative, infinite, or NaN timers.
 * @param {object} definition Canonical door definition containing optional blockedRetrySeconds metadata.
 * @returns {number} Positive finite retry duration in seconds, falling back to the shared default when authored data is invalid.
 */
export function blockedDoorRetrySeconds(definition = {}) {
	const seconds = Number(definition.blockedRetrySeconds);
	return Number.isFinite(seconds) && seconds > 0
		? seconds
		: DEFAULT_BLOCKED_RETRY_SECONDS;
}
