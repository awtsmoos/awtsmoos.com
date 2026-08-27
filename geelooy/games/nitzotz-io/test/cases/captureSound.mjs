// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	captureRootFrequency,
	captureSoundPlan,
	captureSoundStyle
} from '../../js/sound/capturePlan.js';

/**
 * The Awtsmoos proves captured matter can teach its substance by ear without escaping musical bounds;
 * Awtsmoos.com tests material families, mass weight, combo lift, rare harmony, haptic restraint, and legacy safety.
 */
export function runCaptureSoundCases() {
	checkMaterialFamilies();
	checkMassAndComboDirection();
	checkPlanBounds();
	checkLegacySafety();
	return [
		'capture audio families follow material category rarity and power truth',
		'heavier matter lowers pitch while combo lifts the same material voice',
		'capture voices and haptics remain finite quiet and strictly bounded',
		'legacy reveal payloads still resolve to a safe procedural mote voice'
	];
}

function checkMaterialFamilies() {
	assert.equal(captureSoundStyle(descriptor('botanical', 'foliage')), 'leaf');
	assert.equal(captureSoundStyle(descriptor('nature', 'treeOak')), 'leaf');
	assert.equal(captureSoundStyle(descriptor('small', 'stone')), 'stone');
	assert.equal(captureSoundStyle(descriptor('building', 'none')), 'stone');
	assert.equal(captureSoundStyle(descriptor('vehicle', 'metal')), 'metal');
	assert.equal(captureSoundStyle(descriptor('small', 'parchment')), 'mote');
	assert.equal(captureSoundStyle({ ...descriptor('small', 'none'), rare: true }), 'spark');
	assert.equal(captureSoundStyle({ ...descriptor('pickup', 'none'), power: 'magnet' }), 'spark');
}

function checkMassAndComboDirection() {
	const light = descriptor('small', 'stone', { mass: 4, combo: 1 });
	const heavy = descriptor('small', 'stone', { mass: 400, combo: 1 });
	const streak = descriptor('small', 'stone', { mass: 4, combo: 8 });
	assert.ok(captureRootFrequency('stone', light) > captureRootFrequency('stone', heavy));
	assert.ok(captureRootFrequency('stone', streak) > captureRootFrequency('stone', light));
}

function checkPlanBounds() {
	const ordinary = captureSoundPlan(descriptor('vehicle', 'metal', { mass: 95, combo: 6 }));
	const rare = captureSoundPlan(descriptor('pickup', 'none', { mass: 180, combo: 9, rare: true }));
	assert.ok(ordinary.voices.length >= 1 && ordinary.voices.length <= 2);
	assert.equal(rare.voices.length, 3);
	for (const plan of [ordinary, rare]) {
		assert.ok(plan.hapticMs >= 7 && plan.hapticMs <= 46);
		for (const voice of plan.voices) assertVoiceBounds(voice);
	}
}

function checkLegacySafety() {
	const plan = captureSoundPlan({ sparks: 20 });
	assert.equal(plan.style, 'mote');
	assert.ok(plan.voices.length > 0);
	assert.ok(plan.voices.every(voice => Number.isFinite(voice.frequency)));
}

function assertVoiceBounds(voice) {
	assert.ok(Number.isFinite(voice.frequency) && voice.frequency >= 90 && voice.frequency <= 1600);
	assert.ok(Number.isFinite(voice.endFrequency) && voice.endFrequency >= 90 && voice.endFrequency <= 1600);
	assert.ok(Number.isFinite(voice.duration) && voice.duration >= 0.035 && voice.duration <= 0.18);
	assert.ok(Number.isFinite(voice.gain) && voice.gain >= 0.006 && voice.gain <= 0.04);
	assert.ok(Number.isFinite(voice.delay) && voice.delay >= 0 && voice.delay <= 0.08);
	assert.ok(['sine', 'triangle', 'square', 'sawtooth'].includes(voice.type));
}

function descriptor(category, material, overrides = {}) {
	return {
		category,
		material,
		mass: 24,
		radius: 8,
		combo: 2,
		sparks: 18,
		rare: false,
		power: null,
		...overrides
	};
}
