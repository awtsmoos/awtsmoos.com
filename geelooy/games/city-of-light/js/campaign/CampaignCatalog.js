//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CampaignCatalog
 * @description
 * Twenty-four authored chapters gather into one ordered pilgrimage. The streets
 * remain generated, but the Awtsmoos.com campaign remembers what each chapter
 * teaches, combines, rewards, and asks the player to complete.
 */

import { CHAPTERS_DAWN } from './chaptersDawn.js';
import { CHAPTERS_GARDEN } from './chaptersGarden.js';
import { CHAPTERS_RIVER } from './chaptersRiver.js';
import { CHAPTERS_ARCHIVE } from './chaptersArchive.js';
import { CHAPTERS_HEIGHTS } from './chaptersHeights.js';
import { CHAPTERS_HEART } from './chaptersHeart.js';
import { regionById } from './RegionCatalog.js';

export const CAMPAIGN_CHAPTERS = Object.freeze([
	...CHAPTERS_DAWN,
	...CHAPTERS_GARDEN,
	...CHAPTERS_RIVER,
	...CHAPTERS_ARCHIVE,
	...CHAPTERS_HEIGHTS,
	...CHAPTERS_HEART
]);

export function chapterByNumber(chapterNumber) {
	const safeNumber = Math.max(1, Math.min(
		CAMPAIGN_CHAPTERS.length,
		Math.floor(Number(chapterNumber) || 1)
	));
	return CAMPAIGN_CHAPTERS[safeNumber - 1];
}

export function chapterById(chapterId) {
	return CAMPAIGN_CHAPTERS.find(chapter => chapter.id === chapterId)
		|| CAMPAIGN_CHAPTERS[0];
}

export function chapterPresentation(chapter) {
	const region = regionById(chapter.region);
	return {
		...chapter,
		regionName: region.name,
		theme: region
	};
}

export function chaptersUnlockedThrough(maximumChapter) {
	const safeMaximum = Math.max(1, Math.floor(Number(maximumChapter) || 1));
	return CAMPAIGN_CHAPTERS.filter(chapter => chapter.number <= safeMaximum);
}
