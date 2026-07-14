// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	createDefaultSave,
	normalizeSave,
	sanitizeRoom
} from '../../js/save/schema.js';

/**
 * The Awtsmoos verifies that schema four adds Adventure vessels without erasing
 * any spark, star, campaign, quest, setting, or record carried from schema three.
 */
export function runSaveV4Cases() {
	return [
		checkDefaults(),
		checkSchemaThreeMigration(),
		checkMalformedValues(),
		checkRoomSanitation()
	];
}

function checkDefaults() {
	const save = createDefaultSave();
	assert.equal(save.schemaVersion, 4);
	assert.equal(save.perutot, 0);
	assert.deepEqual(save.talentTiers, {
		chochmah: 0,
		binah: 0,
		gevurah: 0,
		chesed: 0,
		tiferet: 0
	});
	assert.equal(save.multiplayerRoom, 'malchus');
	return { test: 'save-v4-defaults', schema: save.schemaVersion };
}

function checkSchemaThreeMigration() {
	const raw = {
		schemaVersion: 3,
		sparks: 73,
		unlocked: 81,
		currentLevel: 80,
		selectedChapter: 4,
		stars: { 'tiferes-01': 3 },
		upgradeTiers: { draw: 2, surge: 3, grace: 1, abundance: 4 },
		questProgress: { livingCity: 12 },
		campaignStats: { wins: 8, bossWins: 3, masteryWins: 2, totalMass: 9000 },
		perf: 'medium',
		haptics: false
	};
	const save = normalizeSave(raw);
	assert.equal(save.sparks, 73);
	assert.equal(save.unlocked, 81);
	assert.equal(save.currentLevel, 80);
	assert.equal(save.stars['tiferes-01'], 3);
	assert.equal(save.upgradeTiers.surge, 3);
	assert.equal(save.questProgress.livingCity, 12);
	assert.equal(save.campaignStats.totalMass, 9000);
	assert.equal(save.perf, 'medium');
	assert.equal(save.haptics, false);
	assert.equal(save.perutot, 0);
	return { test: 'save-v4-schema-three-migration', preserved: 9 };
}

function checkMalformedValues() {
	const save = normalizeSave({
		perutot: -44,
		talentTiers: { chochmah: 99, binah: -3, gevurah: '2' },
		adventureStats: { attempts: -9, completions: '4', totalPerutot: null },
		multiplayerRoom: '<script>VOID ROOM</script>'
	});
	assert.equal(save.perutot, 0);
	assert.equal(save.talentTiers.chochmah, 4);
	assert.equal(save.talentTiers.binah, 0);
	assert.equal(save.talentTiers.gevurah, 2);
	assert.equal(save.adventureStats.attempts, 0);
	assert.equal(save.adventureStats.completions, 4);
	assert.equal(save.multiplayerRoom, 'void-room');
	return { test: 'save-v4-normalization', room: save.multiplayerRoom };
}

function checkRoomSanitation() {
	assert.equal(sanitizeRoom('  CHABAD 770! '), 'chabad-770');
	assert.equal(sanitizeRoom('---'), 'malchus');
	assert.equal(sanitizeRoom('abcdefghijklmnop'), 'abcdefghijkl');
	assert.equal(sanitizeRoom('<b>ROOM</b>'), 'room');
	return { test: 'save-v4-room-sanitation', maximum: 12 };
}
