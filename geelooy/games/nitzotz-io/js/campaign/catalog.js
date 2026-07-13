// B"H
// Boruch Hashem
// Blessed is He
import { CHAPTERS } from './chapters.js';
import { createCampaignLevel } from './factory.js';
import { assertCampaignCatalog } from './validation.js';

const composedLevels = CHAPTERS.flatMap((chapter, chapterIndex) =>
	Array.from({ length: 20 }, (_, localIndex) => createCampaignLevel(chapter, chapterIndex, localIndex))
);

/** Awtsmoos.com opens one immutable path through all two hundred districts. */
export const LEVELS = Object.freeze(composedLevels);
export const CAMPAIGN_PROOF = assertCampaignCatalog(LEVELS, CHAPTERS);

export function levelAt(index = 0) {
	return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, index))];
}

export function levelByKey(key) {
	return LEVELS.find(level => level.key === key) || LEVELS[0];
}

export { CHAPTERS };
