// B"H
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUILT_IN_PARTICLE_EFFECT_PRESETS } from '../src/core/proceduralObject/particles/effects/api/builtInParticleEffectPresets.js';
import { createFireflyParticleEffect } from '../src/core/proceduralObject/particles/effects/presets/nature/createFireflyParticleEffect.js';
import { createEmberParticleEffect } from '../src/core/proceduralObject/particles/effects/presets/nature/createEmberParticleEffect.js';
import { createSporeParticleEffect } from '../src/core/proceduralObject/particles/effects/presets/nature/createSporeParticleEffect.js';
import { createMeadowAmbientParticleField } from '../src/core/webgl/particles/MeadowAmbientParticleField.js';

test('new nature presets are registered in the built-in catalog', () => {
	for (const name of ['fireflies', 'embers', 'spores']) {
		assert.equal(typeof BUILT_IN_PARTICLE_EFFECT_PRESETS[name], 'function', `${name} registered`);
		const recipe = BUILT_IN_PARTICLE_EFFECT_PRESETS[name]({ id: `reg-${name}`, count: 12 });
		assert.ok(recipe.meadowField, `${name} carries a meadowField block`);
		assert.ok(Array.isArray(recipe.layers) && recipe.layers.length > 0, `${name} has layers`);
	}
});

test('firefly recipe carries turbulence, thermal lift, and blink', () => {
	const recipe = createFireflyParticleEffect({ id: 'ff-test', count: 50 });
	const types = recipe.layers[0].forces.map(force => force.type);
	assert.ok(types.includes('turbulence'), 'turbulence force present');
	assert.ok(types.includes('thermalBuoyancy'), 'thermal lift present');
	assert.ok(types.includes('drag'), 'drag present');
	assert.ok(recipe.meadowField.blink, 'blink block present');
	assert.ok(recipe.meadowField.additive, 'fireflies render additively');
});

test('ember recipe rises hot and cools with age', () => {
	const recipe = createEmberParticleEffect({ id: 'em-test', count: 40 });
	assert.equal(recipe.meadowField.colorByAge, 'ember-cool');
	assert.ok((recipe.meadowField.forces.thermal?.strength ?? 0) > 1, 'strong thermal rise');
});

test('spore recipe drifts with heavy drag and slow sink', () => {
	const recipe = createSporeParticleEffect({ id: 'sp-test', count: 40 });
	assert.ok(recipe.meadowField.drag >= 1, 'heavy drag for feather drift');
	assert.ok(recipe.meadowField.forces.sink > 0, 'gentle sink present');
	assert.equal(recipe.meadowField.additive, false, 'spores use normal alpha');
});

test('ambient field keeps count stable across updates and respawns', () => {
	const field = createMeadowAmbientParticleField(createFireflyParticleEffect({ id: 'st', count: 60 }));
	assert.ok(field, 'field created');
	assert.equal(field.count, 60);
	for (let step = 0; step < 600; step += 1) {
		field.update(0.05, { time: step * 0.05, wind: [0.3, 0, 0.1], gustScale: 1 });
	}
	const packed = field.pack(30);
	assert.equal(packed.count, 60);
	assert.equal(packed.positions.length, 60 * 3);
	assert.equal(packed.colors.length, 60 * 4);
	assert.equal(packed.sizes.length, 60);
	for (const alpha of packed.colors.filter((_, i) => i % 4 === 3)) {
		assert.ok(alpha >= 0 && alpha <= 1, `alpha ${alpha} in range`);
	}
});

test('ambient field is deterministic for equal seeds', () => {
	const recipe = () => createSporeParticleEffect({ id: 'det', count: 30 });
	const first = createMeadowAmbientParticleField(recipe());
	const second = createMeadowAmbientParticleField(recipe());
	for (let step = 0; step < 20; step += 1) {
		first.update(0.016, { time: step * 0.016 });
		second.update(0.016, { time: step * 0.016 });
	}
	assert.deepEqual([...first.pack(0.32).positions], [...second.pack(0.32).positions]);
});

test('ambient field returns null without a meadowField block', () => {
	assert.equal(createMeadowAmbientParticleField({ id: 'nope' }), null);
	assert.equal(createMeadowAmbientParticleField(null), null);
});
