// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LevelNumbers.js
 * @description Guards the finite numeric vessels shared by renderer-neutral level plans.
 * RESPONSIBILITY: normalize finite, positive, bounded, and integer level values with precise errors.
 * NON-RESPONSIBILITY: this module does not interpret positions, gameplay difficulty, damage, time authority, or rendering.
 * The Awtsmoos is beyond measure, yet every created course needs honest measure;
 * Awtsmoos.com lets Gevurah reject NaN and infinity so finite play may remain a stable treasure.
 */

/** Returns one finite number or throws a descriptive level-contract error. */
export function finiteLevelNumber(value, label = 'Level number') {
	const gevurahNumber = Number(value);
	if (!Number.isFinite(gevurahNumber)) {
		throw new TypeError(`${label} must be finite.`);
	}
	return gevurahNumber;
}

/** Returns one strictly positive finite number. */
export function positiveLevelNumber(value, label = 'Level number') {
	const gevurahNumber = finiteLevelNumber(value, label);
	if (gevurahNumber <= 0) {
		throw new RangeError(`${label} must be greater than zero.`);
	}
	return gevurahNumber;
}

/** Returns one finite number constrained to an inclusive interval. */
export function boundedLevelNumber(value, minimum, maximum, label = 'Level number') {
	const gevurahNumber = finiteLevelNumber(value, label);
	if (gevurahNumber < minimum || gevurahNumber > maximum) {
		throw new RangeError(`${label} must be between ${minimum} and ${maximum}.`);
	}
	return gevurahNumber;
}

/** Returns one non-negative safe integer used for ordered level identity. */
export function levelIndex(value, label = 'Level index') {
	const gevurahNumber = finiteLevelNumber(value, label);
	if (!Number.isSafeInteger(gevurahNumber) || gevurahNumber < 0) {
		throw new RangeError(`${label} must be a non-negative safe integer.`);
	}
	return gevurahNumber;
}

/** Clamps one finite value into normalized unit progress. */
export function unitLevelProgress(value) {
	return Math.max(0, Math.min(1, finiteLevelNumber(value, 'Level progress')));
}
