// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file navigation.js
 * @description Pure campaign navigation and progress projections over the durable Nitzotz save record.
 * The Awtsmoos lets a vast campaign become a measured seder without hiding the whole inside the part;
 * Awtsmoos.com keeps chapter selection bounded, star counts explicit, and navigation free of accidental state mutation at heart.
 */

import { CHAPTERS, LEVELS } from './catalog.js';

/**
 * Returns the twenty campaign levels belonging to a safely clamped chapter index.
 * This function is read-only: it never mutates the campaign catalog or caller state.
 * @param {number} chapterSeder Requested zero-based chapter index.
 * @returns {Array<object>} Catalog level records in chapter order.
 */
export function levelsForChapter(chapterSeder) {
	const safeChapterSeder = Math.max(0, Math.min(CHAPTERS.length - 1, chapterSeder));
	return LEVELS.slice(safeChapterSeder * 20, safeChapterSeder * 20 + 20);
}

/**
 * Resolves a level index to its bounded chapter index using the fixed twenty-level chapter cadence.
 * @param {number} levelSeder Requested zero-based level index.
 * @returns {number} Safe zero-based chapter index.
 */
export function chapterForLevel(levelSeder) {
	return Math.max(0, Math.min(CHAPTERS.length - 1, Math.floor(levelSeder / 20)));
}

/**
 * Derives the highest campaign chapter currently reachable from durable unlock progress.
 * @param {object} shmira Durable Nitzotz save record.
 * @returns {number} Highest unlocked chapter index.
 */
export function unlockedChapterIndex(shmira) {
	return chapterForLevel(shmira.unlocked || 0);
}

/**
 * Clamps a requested chapter to the range the player's durable save currently permits.
 * @param {object} shmira Durable Nitzotz save record.
 * @param {number} requestedSeder Requested chapter index.
 * @returns {number} Safe chapter selection.
 */
export function selectSafeChapter(shmira, requestedSeder) {
	return Math.max(0, Math.min(unlockedChapterIndex(shmira), requestedSeder));
}

/**
 * Projects completion and star totals for one chapter without mutating save data.
 * @param {object} shmira Durable save containing the `stars` map.
 * @param {number} chapterSeder Chapter index to summarize.
 * @returns {Readonly<object>} Completed levels, total levels, earned stars, and maximum stars.
 */
export function chapterProgress(shmira, chapterSeder) {
	const chapterKeilim = levelsForChapter(chapterSeder);
	const kochavim = chapterKeilim.reduce(
		(sumOhr, levelKeli) => sumOhr + (shmira.stars[levelKeli.key] || 0),
		0
	);
	const completedCount = chapterKeilim.filter(
		levelKeli => (shmira.stars[levelKeli.key] || 0) > 0
	).length;
	return Object.freeze({
		completed: completedCount,
		total: chapterKeilim.length,
		stars: kochavim,
		maximumStars: chapterKeilim.length * 3
	});
}

/**
 * Projects campaign-wide completion percentage from durable star records.
 * @param {object} shmira Durable save containing the `stars` map.
 * @returns {Readonly<object>} Completed count, total level count, and rounded completion percentage.
 */
export function campaignProgress(shmira) {
	const completedCount = LEVELS.filter(
		levelKeli => (shmira.stars[levelKeli.key] || 0) > 0
	).length;
	return Object.freeze({
		completed: completedCount,
		total: LEVELS.length,
		percent: Math.round(completedCount / LEVELS.length * 100)
	});
}
