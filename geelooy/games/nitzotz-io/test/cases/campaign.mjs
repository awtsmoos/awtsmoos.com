// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { CHAPTERS, LEVELS } from '../../js/campaign/catalog.js';
import { chapterProgress, levelsForChapter } from '../../js/campaign/navigation.js';
import { estimateAvailableMass } from '../../js/campaign/validation.js';
import { createLevel } from '../../js/level.js';

/** Awtsmoos.com lets deterministic evidence guard every campaign district. */
export function runCampaignCases() {
	return [
		checkCatalogShape(),
		checkLegacyAnchors(),
		checkReachability(),
		checkRepresentativeGeneration(),
		checkChapterNavigation()
	];
}

function checkCatalogShape() {
	assert.equal(LEVELS.length, 200);
	assert.equal(CHAPTERS.length, 10);
	assert.equal(new Set(LEVELS.map(level => level.id)).size, 200);
	assert.equal(new Set(LEVELS.map(level => level.key)).size, 200);
	return { test: 'campaign-shape', levels: LEVELS.length, chapters: CHAPTERS.length };
}

function checkLegacyAnchors() {
	const anchors = [[0, 'Malchus Courtyard'], [20, 'Yesod Market'], [80, 'Tiferes Garden'], [100, 'Gevurah City'], [140, 'Binah Palace'], [160, 'Chochmah Metropolis']];
	for (const [index, name] of anchors) assert.equal(LEVELS[index].name, name);
	return { test: 'campaign-anchors', anchors: anchors.length };
}

function checkReachability() {
	for (const level of LEVELS) assert.ok(level.targetMass < estimateAvailableMass(level), level.key);
	return { test: 'campaign-reachability', finalTarget: LEVELS.at(-1).targetMass };
}

function checkRepresentativeGeneration() {
	const save = { selectedMode: 'classic', perf: 'low' };
	const counts = [];
	for (let index = 0; index < 200; index += 20) counts.push(createLevel(save, index).objects.length);
	assert.ok(counts.every(count => count > 200));
	return { test: 'campaign-generation', samples: counts.length, minimum: Math.min(...counts) };
}

function checkChapterNavigation() {
	assert.equal(levelsForChapter(9).length, 20);
	const save = { stars: { [LEVELS[180].key]: 3 } };
	const progress = chapterProgress(save, 9);
	assert.equal(progress.completed, 1);
	assert.equal(progress.stars, 3);
	return { test: 'campaign-navigation', progress };
}
