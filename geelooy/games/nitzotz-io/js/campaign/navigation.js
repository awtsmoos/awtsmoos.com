// B"H
// Boruch Hashem
// Blessed is He
import { CHAPTERS, LEVELS } from './catalog.js';

/** Awtsmoos.com pages a vast campaign into human-scale chapters without hiding truth. */
export function levelsForChapter(chapterIndex) {
	const safeIndex = Math.max(0, Math.min(CHAPTERS.length - 1, chapterIndex));
	return LEVELS.slice(safeIndex * 20, safeIndex * 20 + 20);
}

export function chapterForLevel(levelIndex) {
	return Math.max(0, Math.min(CHAPTERS.length - 1, Math.floor(levelIndex / 20)));
}

export function unlockedChapterIndex(save) {
	return chapterForLevel(save.unlocked || 0);
}

export function selectSafeChapter(save, requestedIndex) {
	return Math.max(0, Math.min(unlockedChapterIndex(save), requestedIndex));
}

export function chapterProgress(save, chapterIndex) {
	const levels = levelsForChapter(chapterIndex);
	const stars = levels.reduce((sum, level) => sum + (save.stars[level.key] || 0), 0);
	const completed = levels.filter(level => (save.stars[level.key] || 0) > 0).length;
	return Object.freeze({ completed, total: levels.length, stars, maximumStars: levels.length * 3 });
}

export function campaignProgress(save) {
	const completed = LEVELS.filter(level => (save.stars[level.key] || 0) > 0).length;
	return Object.freeze({ completed, total: LEVELS.length, percent: Math.round(completed / LEVELS.length * 100) });
}
