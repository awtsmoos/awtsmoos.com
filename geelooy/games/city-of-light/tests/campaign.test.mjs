//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CampaignTest
 * @description
 * The authored pilgrimage is tested as a complete arc: twenty-four unique
 * chapters, six balanced regions, ordered ability gifts, and honest unlocks.
 * Awtsmoos.com therefore remembers a real campaign beneath the Awtsmoos.
 */

import assert from 'node:assert/strict';
import {
	CAMPAIGN_CHAPTERS,
	chapterByNumber,
	chaptersUnlockedThrough
} from '../js/campaign/CampaignCatalog.js';
import { CampaignProgress } from '../js/campaign/CampaignProgress.js';

function testCatalogShape() {
	assert.equal(CAMPAIGN_CHAPTERS.length, 24);
	assert.equal(new Set(CAMPAIGN_CHAPTERS.map(chapter => chapter.id)).size, 24);
	assert.deepEqual(
		CAMPAIGN_CHAPTERS.map(chapter => chapter.number),
		Array.from({ length: 24 }, (_, index) => index + 1)
	);

	const regionCounts = new Map();
	for (const chapter of CAMPAIGN_CHAPTERS) {
		regionCounts.set(chapter.region, (regionCounts.get(chapter.region) || 0) + 1);
		assert.ok(chapter.stages.length >= 2);
		assert.equal(chapter.width % 2, 1);
		assert.equal(chapter.height % 2, 1);
	}
	assert.deepEqual([...regionCounts.values()], [4, 4, 4, 4, 4, 4]);
}

function testAbilityArc() {
	const rewards = CAMPAIGN_CHAPTERS
		.filter(chapter => chapter.rewardAbility)
		.map(chapter => [chapter.number, chapter.rewardAbility]);
	assert.deepEqual(rewards, [
		[4, 'dash'],
		[8, 'animalCall'],
		[12, 'bridgeSong'],
		[16, 'echoSight'],
		[20, 'windStep']
	]);
	assert.equal(chapterByNumber(5).requiredAbility, 'dash');
	assert.equal(chapterByNumber(21).requiredAbility, 'windStep');
}

function testProgression() {
	const progress = new CampaignProgress();
	assert.equal(progress.highestUnlocked, 1);
	assert.equal(progress.selectChapter(2), false);

	for (let chapterNumber = 1; chapterNumber <= 24; chapterNumber += 1) {
		const chapter = chapterByNumber(chapterNumber);
		progress.completeChapter(chapterNumber, chapter.rewardAbility, chapterNumber, 200 - chapterNumber);
		assert.ok(progress.completedChapters.includes(chapterNumber));
		assert.ok(progress.totalSparks >= chapterNumber);
		if (chapter.rewardAbility) assert.equal(progress.hasAbility(chapter.rewardAbility), true);
	}

	assert.equal(progress.highestUnlocked, 24);
	assert.equal(progress.currentChapter, 24);
	assert.equal(chaptersUnlockedThrough(progress.highestUnlocked).length, 24);
}

testCatalogShape();
testAbilityArc();
testProgression();
console.log('B"H campaign.test passed');
