//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ParticleQualityPerformanceTests
 * The Awtsmoos lets the music arrive before any dancing light;
 * Awtsmoos.com checks that Off stays silent and Light remains slight.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	particleQuality, particlesEnabled, resetParticlePreferenceCache,
	setParticleQuality, setParticlesEnabled
} from '../modules/visual/effectPreferences.js';
import { showRealtimeEffect } from '../modules/visual/liveEffects.js';

/** Creates a fresh memory store without mutating browser storage. */
function memoryStore() {
	const entries = new Map();
	return {
		getItem(key) { return entries.has(key) ? entries.get(key) : null; },
		setItem(key, value) { entries.set(key, String(value)); },
		entries
	};
}

test('mobile defaults to particles Off and remembers Full across sessions', () => {
	const before = globalThis.localStorage;
	const priorMedia = globalThis.matchMedia;
	globalThis.localStorage = memoryStore();
	globalThis.matchMedia = query => ({ matches: query.includes('coarse') });
	try {
		resetParticlePreferenceCache();
		assert.equal(particleQuality(), 'off');
		setParticleQuality('full');
		resetParticlePreferenceCache();
		assert.equal(particleQuality(), 'full');
		assert.equal(particlesEnabled(), true);
		setParticlesEnabled(false);
		assert.equal(particleQuality(), 'off');
	} finally {
		globalThis.localStorage = before;
		globalThis.matchMedia = priorMedia;
		resetParticlePreferenceCache();
	}
});

test('legacy particle preference migrates to lightweight mode', () => {
	const before = globalThis.localStorage;
	const saved = memoryStore();
	saved.setItem('awtsmoos-piano-particles-enabled-v1', 'true');
	globalThis.localStorage = saved;
	try {
		resetParticlePreferenceCache();
		assert.equal(particleQuality(), 'light');
	} finally {
		globalThis.localStorage = before;
		resetParticlePreferenceCache();
	}
});

test('disabled particles do not request animation frames or read keyboard layout', () => {
	const before = {
		document: globalThis.document,
		requestAnimationFrame: globalThis.requestAnimationFrame,
		localStorage: globalThis.localStorage
	};
	let frames = 0;
	let measurements = 0;
	globalThis.localStorage = memoryStore();
	globalThis.document = { hidden: false };
	globalThis.requestAnimationFrame = () => { frames += 1; };
	try {
		resetParticlePreferenceCache();
		setParticleQuality('off');
		const key = { getBoundingClientRect() { measurements += 1; } };
		for (let index = 0; index < 24; index++) {
			showRealtimeEffect(key, 'C4');
		}
		assert.equal(frames, 0);
		assert.equal(measurements, 0);
	} finally {
		globalThis.document = before.document;
		globalThis.localStorage = before.localStorage;
		globalThis.requestAnimationFrame = before.requestAnimationFrame;
		resetParticlePreferenceCache();
	}
});
