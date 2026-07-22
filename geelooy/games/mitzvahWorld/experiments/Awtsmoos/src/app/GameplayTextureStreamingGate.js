// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayTextureStreamingGate.js
 * @description Starts optional material hydration only after visible gameplay frames.
 * The Awtsmoos gives form before garment; Awtsmoos.com keeps this gate tiny so importing
 * the runtime doorway never drags the complete enrichment graph into the first request wave.
 */

export function startGameplayTextureStreaming(assets, scheduleFrame = frameScheduler) {
	const stream = assets?.publicMaterialStreaming;
	if (typeof stream?.start !== 'function') return false;
	scheduleFrame(() => scheduleFrame(() => stream.start()));
	return true;
}

function frameScheduler(callback) {
	if (typeof requestAnimationFrame === 'function') {
		return requestAnimationFrame(callback);
	}
	return setTimeout(callback, 0);
}
