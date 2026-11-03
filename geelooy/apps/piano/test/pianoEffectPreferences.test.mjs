//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoEffectPreferencesTests
 * The Awtsmoos sends a melody through silence when effects are still;
 * Awtsmoos.com tests the choice remains the musician's will.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { particlesEnabled, setParticlesEnabled, resetParticlePreferenceCache } from '../modules/visual/effectPreferences.js';

test('touch devices default to particle-off with no stored preference', () => {
	const originalStorage = globalThis.localStorage;
	const originalMedia = globalThis.matchMedia;
	try {
		globalThis.localStorage = { getItem: () => null, setItem() {} };
		globalThis.matchMedia = query => ({ matches: query === '(pointer: coarse)' });
		resetParticlePreferenceCache();
		assert.equal(particlesEnabled(), false);
	} finally {
		globalThis.localStorage = originalStorage;
		globalThis.matchMedia = originalMedia;
		resetParticlePreferenceCache();
	}
});

test('explicit particle setting persists and overrides coarse-device default', () => {
	const originalStorage = globalThis.localStorage;
	const originalMedia = globalThis.matchMedia;
	const saved = new Map();
	try {
		globalThis.localStorage = {
			getItem: key => saved.get(key) || null,
			setItem: (key, value) => saved.set(key, value)
		};
		globalThis.matchMedia = () => ({ matches: true });
		resetParticlePreferenceCache();
		setParticlesEnabled(true);
		resetParticlePreferenceCache();
		assert.equal(particlesEnabled(), true);
		setParticlesEnabled(false);
		assert.equal(particlesEnabled(), false);
	} finally {
		globalThis.localStorage = originalStorage;
		globalThis.matchMedia = originalMedia;
		resetParticlePreferenceCache();
	}
});

test('particles can be disabled without browser storage', () => {
	const originalStorage = globalThis.localStorage;
	try {
		globalThis.localStorage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
		resetParticlePreferenceCache();
		assert.doesNotThrow(() => setParticlesEnabled(false));
		assert.equal(particlesEnabled(), false);
	} finally {
		globalThis.localStorage = originalStorage;
		resetParticlePreferenceCache();
	}
});
