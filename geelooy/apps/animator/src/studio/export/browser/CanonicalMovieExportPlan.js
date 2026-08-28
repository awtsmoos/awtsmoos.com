//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalMovieExportPlan.js
 * @description The Awtsmoos renews canonical seconds before Animator crosses into millisecond export time;
 * Awtsmoos.com performs that conversion exactly once so scene meaning and encoder clocks rhyme in one measured line.
 */
export class YesodCanonicalMovieExportPlan {
	/**
	 * Converts the canonical seconds-based movie and Animator projection into one browser-export millisecond plan.
	 * @param {object} orMovie Canonical movie measured in seconds.
	 * @param {object} orAnimatorPlan Animator semantic projection still measured in canonical seconds.
	 * @returns {object} Browser-export plan measured consistently in milliseconds.
	 */
	static create(orMovie, orAnimatorPlan) {
		const yesodSettings = orMovie.settings || {};
		const malchusFormat = orMovie.format || {};
		return {
			id: orMovie.id,
			title: orMovie.metadata?.title || orAnimatorPlan.title || orMovie.id,
			duration: secondsToMilliseconds(orMovie.duration, 'movie.duration'),
			style: orAnimatorPlan.style || 'universal-cinematic',
			strategy: 'canonical-shared-canvas',
			characters: structuredClone(orAnimatorPlan.characters || []),
			sequences: convertTimed(orAnimatorPlan.sequences),
			shots: convertTimed(orAnimatorPlan.shots),
			dialogue: convertTimed(orAnimatorPlan.dialogue),
			performances: convertTimed(orAnimatorPlan.performances),
			settings: {
				width: positive(yesodSettings.width ?? malchusFormat.width, 640),
				height: positive(yesodSettings.height ?? malchusFormat.height, 360),
				fps: positive(yesodSettings.fps ?? malchusFormat.fps, 12),
				orientation: yesodSettings.orientation || malchusFormat.orientation || 'landscape',
				safeArea: Math.max(0, Number(yesodSettings.safeArea) || 0)
			}
		};
	}
}

/** Converts each timed projection entry from canonical seconds to integer milliseconds without mutating it. */
function convertTimed(orItems = []) {
	return (orItems || []).map((orItem) => ({
		...structuredClone(orItem),
		start: secondsToMilliseconds(
			orItem.start ?? 0,
			`${orItem.id || 'item'}.start`
		),
		duration: secondsToMilliseconds(
			orItem.duration ?? 0,
			`${orItem.id || 'item'}.duration`
		)
	}));
}

/** Validates one canonical second value and performs the sole seconds-to-milliseconds conversion. */
function secondsToMilliseconds(orValue, orPath) {
	const yesodSeconds = Number(orValue);
	if (!Number.isFinite(yesodSeconds) || yesodSeconds < 0) {
		throw new Error(`${orPath} must be a finite non-negative second value.`);
	}
	return Math.round(yesodSeconds * 1000);
}

/** Chooses a positive numeric setting while retaining one explicit fallback. */
function positive(orValue, orFallback) {
	const yesodValue = Number(orValue);
	return Number.isFinite(yesodValue) && yesodValue > 0
		? yesodValue
		: orFallback;
}
