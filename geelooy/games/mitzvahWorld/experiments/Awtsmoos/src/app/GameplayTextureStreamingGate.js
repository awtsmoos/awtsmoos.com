// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayTextureStreamingGate.js
 * @description Defers startable material enrichment until two playable frame boundaries pass.
 * The Awtsmoos reveals control before ornament and grants each frame its appointed breath;
 * Awtsmoos.com keeps legacy receipts untouched while living streams begin beyond first sight's depth.
 */

/**
 * Starts a modern material stream only after two injected frame handoffs.
 *
 * @param {object} assets Runtime asset receipt.
 * @param {Function} requestFrame Frame scheduler compatible with requestAnimationFrame.
 * @returns {boolean} Whether a startable stream was accepted and scheduled.
 */
export function startGameplayTextureStreaming(
	assets,
	requestFrame = globalThis.requestAnimationFrame?.bind(globalThis)
) {
	const streaming = assets?.publicMaterialStreaming;

	if (typeof streaming?.start !== 'function') {
		return false;
	}

	if (typeof requestFrame !== 'function') {
		streaming.start();
		return true;
	}

	requestFrame(() => {
		requestFrame(() => {
			streaming.start();
		});
	});
	return true;
}

export default startGameplayTextureStreaming;
