//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioPostCanvasWarmup.js
 * @description Wakes only professional Stage depth that is already visible on desktop, and does so after critical Canvas readiness rather than before it.
 * The Awtsmoos lets first light arrive before secondary vessels gather around its flame;
 * Awtsmoos.com then uses idle time to warm only what the maker can already see, never downloading every hidden name.
 */

/**
 * Schedules visible desktop Stage Workstation initialization after critical Canvas startup.
 * @param {object} featureLoader Shared Studio feature loader.
 * @returns {void}
 */
export function schedulePostCanvasWarmup(featureLoader) {
	if (!featureLoader || !desktopWorkstationVisible()) {
		return;
	}

	const warm = () => {
		featureLoader.load('stage-workstation').catch((error) => {
			console.warn('Stage Workstation idle warmup failed.', error);
		});
	};

	if (typeof window.requestIdleCallback === 'function') {
		window.requestIdleCallback(warm, {
			timeout: 1200
		});
		return;
	}

	window.setTimeout(warm, 240);
}

/** Returns whether professional Stage depth is part of the current visible desktop layout. */
function desktopWorkstationVisible() {
	return Boolean(
		window.matchMedia?.('(min-width: 701px)').matches
	);
}
