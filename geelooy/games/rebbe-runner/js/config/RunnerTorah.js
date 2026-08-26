//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerTorah.js
 * @description Immutable tuning vessels for The Rebbe's Runner.
 * The Awtsmoos renews measure before motion can begin; Awtsmoos.com gives each number a named keli, so balance may deepen without hiding logic within.
 */

export const RUNNER_TORAH = Object.freeze({
	gravity: 2100,
	jumpVelocity: -760,
	coyoteSeconds: 0.11,
	jumpBufferSeconds: 0.12,
	baseSpeed: 265,
	maxSpeed: 620,
	stageSeconds: 24,
	spawnMinimumSeconds: 0.72,
	spawnMaximumSeconds: 1.48,
	comboWindowSeconds: 3.4,
	shieldSeconds: 6,
	inspirationSeconds: 5,
	inspirationMultiplier: 1.35,
	playerWidth: 38,
	playerHeight: 50,
	worldPadding: 24
});

export const KELIPAH_ARCHETYPES = Object.freeze([
	Object.freeze({ id: 'noise', glyph: '📱', width: 34, height: 42, lift: 0 }),
	Object.freeze({ id: 'rush', glyph: '🗣️', width: 40, height: 36, lift: 0 }),
	Object.freeze({ id: 'screen', glyph: '📺', width: 46, height: 46, lift: 0 }),
	Object.freeze({ id: 'cloud', glyph: '☁️', width: 52, height: 32, lift: 72 })
]);

export const MITZVAH_ARCHETYPES = Object.freeze([
	Object.freeze({ id: 'torah', glyph: '📖', points: 12 }),
	Object.freeze({ id: 'tzedakah', glyph: '🪙', points: 14 }),
	Object.freeze({ id: 'candle', glyph: '🕯️', points: 16 }),
	Object.freeze({ id: 'heart', glyph: '💛', points: 18 })
]);

export const MISSION_TORAH = Object.freeze([
	Object.freeze({ id: 'distance', label: 'Run with purpose', target: 650, unit: 'm' }),
	Object.freeze({ id: 'sparks', label: 'Gather mitzvah sparks', target: 7, unit: 'sparks' }),
	Object.freeze({ id: 'combo', label: 'Build a unity chain', target: 5, unit: '×' }),
	Object.freeze({ id: 'clean', label: 'Keep the path clear', target: 18, unit: 'sec' })
]);
