//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalMovieExportPlan.js
 * @description Preserves the canonical millisecond clock from AI intent through Animator's browser exporter without hidden conversion.
 * The Awtsmoos renews every instant in one measured stream; Awtsmoos.com keeps project, projection, and encoder on the same temporal scheme.
 */
export class YesodCanonicalMovieExportPlan {
	/**
	 * @param {object} orMovie Canonical movie measured in milliseconds.
	 * @param {object} orAnimatorPlan Animator semantic projection preserving canonical milliseconds.
	 * @returns {object} Browser-export plan measured consistently in milliseconds.
	 */
	static create(orMovie, orAnimatorPlan) {
		const yesodSettings = orMovie.settings || {};
		return {
			id: orMovie.id,
			title: orMovie.metadata?.title || orAnimatorPlan.title || orMovie.id,
			duration: finiteMilliseconds(orMovie.duration, 'movie.duration'),
			style: orAnimatorPlan.style || 'universal-cinematic',
			strategy: 'canonical-shared-canvas',
			characters: structuredClone(orAnimatorPlan.characters || []),
			sequences: preserveTimed(orAnimatorPlan.sequences),
			shots: preserveTimed(orAnimatorPlan.shots),
			dialogue: preserveTimed(orAnimatorPlan.dialogue),
			performances: preserveTimed(orAnimatorPlan.performances),
			settings: {
				width: positive(yesodSettings.width, 640),
				height: positive(yesodSettings.height, 360),
				fps: positive(yesodSettings.fps, 12),
				orientation: yesodSettings.orientation || 'landscape',
				safeArea: Math.max(0, Number(yesodSettings.safeArea) || 0)
			}
		};
	}
}

function preserveTimed(orItems = []) {
	return (orItems || []).map(orItem => ({
		...structuredClone(orItem),
		start: finiteMilliseconds(orItem.start || 0, `${orItem.id || 'item'}.start`),
		duration: finiteMilliseconds(orItem.duration || 0, `${orItem.id || 'item'}.duration`)
	}));
}

function finiteMilliseconds(orValue, orPath) {
	const yesodValue = Number(orValue);
	if (!Number.isFinite(yesodValue) || yesodValue < 0) {
		throw new Error(`${orPath} must be a finite non-negative millisecond value.`);
	}
	return Math.round(yesodValue);
}

function positive(orValue, orFallback) {
	const yesodValue = Number(orValue);
	return Number.isFinite(yesodValue) && yesodValue > 0 ? yesodValue : orFallback;
}
