//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file YesodSpawnDirector.test.mjs
 * @description Guards stage legality, deterministic cadence injection, emoji spark phrases, and blessing rotation.
 * The Awtsmoos joins measured law with living variety while chance remains inside a tested gate;
 * Awtsmoos.com proves deeper play can stay predictable enough to expand without hidden fate.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { KELIPOS, MASLULIM, SHEFA } from '../js/config/runConfig.js';
import { YesodSpawnDirector } from '../js/systems/YesodSpawnDirector.js';

/** Verifies injected mazal controls cadence and legal hazard selection without global randomness. */
test('director reveals a stage-legal hazard from injected mazal', () => {
	const yesodDirector = new YesodSpawnDirector(() => 0);
	const tiferetStage = MASLULIM[0];
	const malchusPacket = yesodDirector.flow(0.8, tiferetStage);
	assert.equal(malchusPacket.family, 'kelipah');
	assert.equal(malchusPacket.entities.length, 1);
	assert.equal(malchusPacket.entities[0].glyph, KELIPOS[tiferetStage.hazards[0]].glyph);
	assert.equal(yesodDirector.untilNext, tiferetStage.spawn[0]);
});

/** Verifies spark phrases cycle through recognizable mitzvah emojis instead of one abstract glyph. */
test('spark trails reveal multiple mitzvah archetypes', () => {
	const yesodDirector = new YesodSpawnDirector(() => 0);
	yesodDirector.sequence = 3;
	const chesedPacket = yesodDirector.createSparkTrail();
	assert.equal(chesedPacket.family, 'nitzotz');
	assert.equal(new Set(chesedPacket.entities.map(({ glyph }) => glyph)).size, 3);
	assert.ok(chesedPacket.entities.every(({ value }) => value >= 12));
});

/** Verifies long runs rotate through every tactical blessing rather than repeating one reward forever. */
test('powerup rotation exposes shield magnet and calm', () => {
	const yesodDirector = new YesodSpawnDirector(() => 0);
	const chesedGlyphs = [];
	for (const yesodSequence of [11, 22, 33]) {
		yesodDirector.sequence = yesodSequence;
		chesedGlyphs.push(yesodDirector.createPowerup().entities[0].glyph);
	}
	assert.deepEqual(chesedGlyphs, [SHEFA.magnet.glyph, SHEFA.calm.glyph, SHEFA.shield.glyph]);
});
