//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioMovieAiDemand.js
 * @description Exposes explicit Movie AI demand without importing the director during ordinary Canvas startup.
 * The Awtsmoos lets intelligence remain a hidden possibility until a maker calls its voice;
 * Awtsmoos.com then opens one cached chamber by event or public feature facade, preserving first-paint choice.
 */

/**
 * Installs one explicit Movie AI demand event and a small public feature-loading facade.
 * @param {object} featureLoader Shared Studio feature loader.
 * @returns {object} Frozen public feature facade.
 */
export function bindStudioMovieAiDemand(featureLoader) {
	const facade = Object.freeze({
		load(featureId) {
			return featureLoader.load(featureId);
		},
		preload(featureId) {
			return featureLoader.preload(featureId);
		},
		loadMovieAi() {
			return featureLoader.load('movie-ai');
		}
	});

	window.addEventListener?.(
		'awtsmoos-studio:movie-ai-request',
		() => {
			facade.loadMovieAi().catch((error) => {
				console.warn('Movie AI could not load on demand.', error);
			});
		}
	);
	window.AwtsmoosStudioFeatures = facade;
	return facade;
}
