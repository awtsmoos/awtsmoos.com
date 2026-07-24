// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowHebrewProjectileVisual.test.mjs
 * @description Proves solid Hebrew geometry, configured vocabulary, pooling, motion, and cleanup.
 * The Awtsmoos renews every tested stroke and finite path; Awtsmoos.com asks evidence to show
 * that Hebrew—not circles or textures—is primary, readable, reusable, and renderer-safe.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import {
	createHebrewProjectile,
	hebrewProjectileDiagnostics,
	releaseHebrewProjectile,
	updateHebrewProjectile
} from '../../app/MinimalMeadowHebrewProjectile.js';
import {
	createImpactExplosion,
	createProjectileTrail,
	particleEffectDiagnostics,
	releaseParticleEffect,
	updateParticleEffect
} from '../../app/MinimalMeadowParticleEffects.js';
import { hebrewGlyphTextureDiagnostics } from '../../app/MinimalMeadowHebrewGlyphTexture.js';
import { hebrewStrokeAlphabetDiagnostics } from '../../app/MinimalMeadowHebrewStrokeAlphabet.js';

const action = Object.freeze({ color: [1, 0.2, 0.04, 1], damage: 28, letters: 'אש', speed: 8 });
const target = { alive: true, targetHint: () => ({ x: 4, y: 1, z: 0 }) };

test('projectile renders solid Hebrew in three crossed cached views', () => {
	const projectile = createHebrewProjectile({ x: 0, y: 1, z: 0 }, target, action);
	const view = projectile.glyphCards.children[0];
	assert.equal(projectile.glyphCards.children.length, 3);
	assert.equal(view.geometry.userData.hebrewLetters, 'אש');
	assert.equal(view.geometry.userData.renderMode, 'solid-stroke-geometry');
	assert.ok(view.geometry.userData.strokeCount >= 8);
	assert.equal(view.material.mapImage, undefined);
	assert.equal(view.material.transparent, false);
	assert.equal(projectile.group.userData.primaryVisual, 'solid-hebrew-geometry');
	assert.deepEqual(hebrewGlyphTextureDiagnostics(), {
		canvases: 0,
		materials: 1,
		renderMode: 'solid-stroke-geometry'
	});
	releaseHebrewProjectile(projectile);
});

test('configured player and enemy Hebrew vocabulary has explicit strokes', () => {
	const configured = hebrewStrokeAlphabetDiagnostics().configuredLetters;
	for (const letter of [...'אשאורחידיןמכה']) {
		assert.ok(configured.includes(letter), `missing explicit strokes for ${letter}`);
	}
});

test('projectile tracks target, impacts, and reuses its visual vessel', () => {
	const scene = new Group();
	const first = createHebrewProjectile({ x: 0, y: 1, z: 0 }, target, action);
	scene.add(first.group);
	const state = updateHebrewProjectile(first, 0.5);
	assert.ok(first.group.position.x > 0);
	assert.equal(state.impact, true);
	assert.equal(hebrewProjectileDiagnostics(first).glyphViews, 3);
	releaseHebrewProjectile(first);
	const second = createHebrewProjectile({ x: 0, y: 1, z: 0 }, target, action);
	assert.equal(second, first);
	assert.ok(hebrewProjectileDiagnostics().pool.reused >= 1);
	releaseHebrewProjectile(second);
});

test('supporting particles remain bounded and reusable', () => {
	const trail = createProjectileTrail({ x: 1, y: 2, z: 3 }, action.color);
	const impact = createImpactExplosion({ x: 1, y: 2, z: 3 }, action.color, 99);
	assert.equal(trail.particles.length, 3);
	assert.equal(impact.particles.length, 12);
	assert.equal(updateParticleEffect(trail, 0.5), true);
	assert.equal(updateParticleEffect(impact, 0.8), true);
	releaseParticleEffect(trail);
	releaseParticleEffect(impact);
	const reused = createProjectileTrail({ x: 0, y: 0, z: 0 }, action.color);
	assert.equal(reused, trail);
	assert.ok(particleEffectDiagnostics().trail.reused >= 1);
	releaseParticleEffect(reused);
});
