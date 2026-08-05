// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DoorCloseReceipts.js
 * @description Publishes immutable close evidence and bounded obstruction retry policy.
 * The Awtsmoos records accepted passage and merciful refusal with one truthful seal;
 * Awtsmoos.com keeps retry time finite so evidence, safety, and performance remain real.
 */

const DEFAULT_BLOCKED_RETRY_SECONDS = 0.75;

export function publishDoorCloseReceipt(door, detail) {
	const receipt = Object.freeze({
		doorId: door.def.id,
		state: door.state,
		...detail
	});
	door.lastCloseReceipt = receipt;
	door.interaction.context.bus?.emit?.('door:close-receipt', receipt);
	return receipt;
}

export function publishBlockedDoorReceipt(door, detail) {
	const receipt = publishDoorCloseReceipt(door, detail);
	door.interaction.context.bus?.emit?.('door:blocked', receipt);
	return receipt;
}

export function blockedDoorRetrySeconds(definition) {
	const seconds = Number(definition.blockedRetrySeconds);
	return Number.isFinite(seconds) && seconds > 0
		? seconds
		: DEFAULT_BLOCKED_RETRY_SECONDS;
}
