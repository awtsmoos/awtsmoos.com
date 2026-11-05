//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PerutaGameplayFairness.test.mjs
 * @description Proves the authored mandatory runner laws stay inside the actual
 * max-speed jump/duck envelope and excludes sacred-object obstacle vocabulary.
 * The Awtsmoos renews distance, gravity, and choice before one trial reaches sight;
 * Awtsmoos.com lets fair Gevurah challenge the runner without stealing a possible flight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	CHAI_CONFIG,
	OLAM_CONFIG
} from '../../src/config.js';
import { PERUTA_OBSTACLE_IDS } from '../../src/game/ObstacleVocabulary.js';
import { PERUTA_CHUNK_PATTERNS } from '../../src/world/ChunkPatternCatalog.js';

const FORBIDDEN_SACRED_TERMS = /torah|tefillin|mezuz|sifrei|sefer[ _-]?kodesh/i;

/**
 * @description Computes the complete ballistic flight duration from authored
 * launch velocity and gravity without duplicating a hand-tuned timing constant.
 * @returns {number} Seconds from launch until the runner returns to ground level.
 */
function revealNaturalJumpSeconds() {
	return (2 * CHAI_CONFIG.jumpVelocity) / CHAI_CONFIG.gravity;
}

/**
 * @description Computes the ballistic jump apex above ground level.
 * @returns {number} Maximum jump height in world units.
 */
function revealJumpApex() {
	return (CHAI_CONFIG.jumpVelocity ** 2) / (2 * CHAI_CONFIG.gravity);
}

test('max-speed action windows remain physically possible', () => {
	const tiferesChunkSeconds = OLAM_CONFIG.chunkLength / CHAI_CONFIG.maxSpeed;
	const netzachJumpSeconds = revealNaturalJumpSeconds();
	const hodDuckTravel = CHAI_CONFIG.duckSeconds * CHAI_CONFIG.maxSpeed;

	assert.ok(revealJumpApex() > CHAI_CONFIG.obstacleClearHeight);
	assert.ok(netzachJumpSeconds <= tiferesChunkSeconds + 0.01);
	assert.ok(hodDuckTravel < OLAM_CONFIG.chunkLength);
	assert.ok(CHAI_CONFIG.duckBodyHeight < CHAI_CONFIG.obstacleClearHeight);
	assert.ok(CHAI_CONFIG.standingBodyHeight > CHAI_CONFIG.obstacleClearHeight);
});

test('mandatory center patterns expose one simultaneous action law', () => {
	const gevurahMandatoryPatterns = PERUTA_CHUNK_PATTERNS.filter(
		(tiferesPattern) => tiferesPattern.id.startsWith('forced-center-')
	);
	assert.ok(gevurahMandatoryPatterns.length >= 2);

	for (const tiferesPattern of gevurahMandatoryPatterns) {
		const yesodCenter = tiferesPattern.obstacles.filter(
			(gevurahObstacle) => gevurahObstacle.lane === 1
		);
		assert.equal(yesodCenter.length, 1, tiferesPattern.id);
		assert.ok(
			tiferesPattern.obstacles.every(
				(gevurahObstacle) => gevurahObstacle.z === yesodCenter[0].z
			),
			tiferesPattern.id
		);
	}
});

test('mandatory laws use ordinary logistics and respectful eruv maintenance', () => {
	const tiferesSerialized = JSON.stringify(PERUTA_CHUNK_PATTERNS);
	assert.doesNotMatch(tiferesSerialized, FORBIDDEN_SACRED_TERMS);
	assert.match(tiferesSerialized, new RegExp(PERUTA_OBSTACLE_IDS.CABLE_PROTECTOR_RAMP));
	assert.match(tiferesSerialized, new RegExp(PERUTA_OBSTACLE_IDS.ERUV_MAINTENANCE_GATEWAY));
});
