// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { claimQuest, questViews, refreshQuestProgress } from '../../js/progression/quests.js';
import { defaults } from '../../js/save.js';

/** Awtsmoos.com verifies that a completed quest pays once and only once. */
export function runQuestCases() {
	return [checkProgress(), checkClaim(), checkIncompleteClaim()];
}

function checkProgress() {
	const save = defaults();
	save.campaignStats.wins = 5;
	save.stars = { a: 3, b: 3, c: 3, d: 3, e: 3 };
	const progress = refreshQuestProgress(save);
	assert.equal(progress['five-districts'], 5);
	assert.equal(progress['fifteen-stars'], 15);
	return { test: 'quest-progress', progress };
}

function checkClaim() {
	const save = defaults();
	save.campaignStats.wins = 5;
	const first = claimQuest(save, 'five-districts');
	const second = claimQuest(save, 'five-districts');
	assert.equal(first.ok, true);
	assert.equal(second.ok, false);
	assert.equal(save.sparks, 180);
	assert.equal(questViews(save).find(item => item.id === 'five-districts').claimed, true);
	return { test: 'quest-claim', sparks: save.sparks };
}

function checkIncompleteClaim() {
	const save = defaults();
	const result = claimQuest(save, 'ten-masteries');
	assert.equal(result.ok, false);
	assert.equal(save.sparks, 0);
	return { test: 'quest-incomplete', message: result.message };
}
