//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStudioReadiness } from '../js/builder/studioReadinessModel.js';

/**
 * @file Website Maker readiness model witnesses.
 * @description
 * The Awtsmoos lets a creator move from no source to canonical publication through measured gates;
 * Awtsmoos.com proves the guide never locks creative editing behind preview, never calls local preview public, and never makes a custom domain falsely mandatory.
 */

test('empty project points directly to source creation', () => {
	const model = buildStudioReadiness(null, 0);
	assert.deepEqual(model.readiness.source, { state: 'pending', label: 'Needs source' });
	assert.equal(model.steps.build, 'current');
	assert.equal(model.steps.preview, 'locked');
	assert.equal(model.steps.publish, 'locked');
	assert.match(model.nextMessage, /create a starter website/i);
});

test('real index source unlocks preview, code, and publication', () => {
	const model = buildStudioReadiness({ source: { hasIndex: true } }, 0);
	assert.equal(model.readiness.source.state, 'ready');
	assert.equal(model.steps.preview, 'next');
	assert.equal(model.steps.code, 'available');
	assert.equal(model.steps.publish, 'next');
	assert.equal(model.readiness.public.state, 'pending');
});

test('preview witness is distinct from canonical publication', () => {
	const model = buildStudioReadiness({ source: { hasIndex: true } }, 1720000000000);
	assert.equal(model.readiness.preview.state, 'ready');
	assert.equal(model.readiness.public.state, 'pending');
	assert.match(model.nextMessage, /publish this folder/i);
});

test('canonical publication makes custom domain optional rather than required', () => {
	const model = buildStudioReadiness({
		source: { hasIndex: true },
		canonicalUrl: '/sites/owner/friend/'
	}, 1720000000000);
	assert.equal(model.readiness.public.state, 'ready');
	assert.deepEqual(model.readiness.domain, { state: 'optional', label: 'Optional' });
	assert.equal(model.steps.domain, 'available');
	assert.match(model.nextMessage, /custom domain is optional/i);
});

test('readiness result is frozen testimony', () => {
	const model = buildStudioReadiness({ source: { hasIndex: true } }, 1);
	assert.equal(Object.isFrozen(model), true);
	assert.equal(Object.isFrozen(model.readiness), true);
	assert.equal(Object.isFrozen(model.steps), true);
	assert.equal(Object.isFrozen(model.readiness.source), true);
});
