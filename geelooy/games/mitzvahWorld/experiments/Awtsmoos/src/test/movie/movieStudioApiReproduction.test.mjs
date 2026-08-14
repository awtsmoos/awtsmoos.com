// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiReproduction.test.mjs
 * @description Proves Movie API 2.3.0 can snapshot, clone, apply, enrich, describe, and fingerprint self-recreating posts.
 * The Awtsmoos creates generic Movie and canonical river Short through one API; Awtsmoos.com tests portable intent and resolved truth,
 * so future agents may expand the contract without coupling reproduction to one editor session or one specific film.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

test('generic Movie projects reproduce without requiring canonical world geography', () => {
	const { api } = createMovieStudioApiHarness();
	const snapshot = api.reproduction.snapshot();
	assert.equal(api.apiVersion, '2.3.0');
	assert.equal(api.capabilities.portableReproductionSnapshots, true);
	assert.equal(api.capabilities.selfDescribingPosts, true);
	assert.equal(Object.isFrozen(snapshot), true);
	assert.equal(snapshot.schema.version, '2026.08-reproduction-v2');
	assert.equal(snapshot.resolved.world.kind, 'none');
	assert.equal(snapshot.validation.ready, true);
	assert.equal(api.reproduction.fingerprint(snapshot), snapshot.fingerprint);
	assert.match(api.reproduction.describe(snapshot), /Timeline:/);
	const clone = api.reproduction.clone(snapshot, {
		projectOverrides: { title: 'Portable clone' }
	});
	assert.equal(clone.identity.title, 'Portable clone');
	assert.notEqual(clone.fingerprint, snapshot.fingerprint);
	assert.notEqual(snapshot.identity.title, clone.identity.title);
	const applied = api.reproduction.apply(clone);
	assert.equal(applied.identity.title, 'Portable clone');
	assert.equal(api.project.snapshot().title, 'Portable clone');
});

test('44-second canonical river post exposes resolved world, actor, runtime animation, and exact frames', () => {
	const { api } = createMovieStudioApiHarness();
	const base = api.project.snapshot();
	const project = {
		...base,
		duration: 44,
		fps: 30,
		metadata: {
			...(base.metadata || {}),
			shortId: 'eden-river-v7-test',
			shortLayout: 'world-first',
			shortWorld: 'river-garden'
		},
		resolution: { width: 1080, height: 1920 },
		tracks: [{
			id: 'actor-track',
			target: 'player/chossid.glb',
			type: 'actor',
			clips: [{
				animation: 'talk',
				at: { x: -1, y: 2.6, z: 42 },
				duration: 44,
				id: 'actor-clip',
				start: 0
			}]
		}]
	};
	const snapshot = api.reproduction.clone(api.reproduction.snapshot(), {
		project,
		runtimeEvidence: {
			actor: {
				assetUrl: '/mission-asset-pack/chossid.glb',
				catalog: [{ channels: 8, duration: 2.4, index: 3, name: 'Hands Out', pose: false }],
				defaultClip: 'Hands Out',
				selectedClip: 'Hands Out'
			}
		}
	});
	assert.equal(snapshot.resolved.timeline.frameCount, 1320);
	assert.equal(snapshot.resolved.world.resolvedId, 'river-garden');
	assert.equal(snapshot.resolved.world.audit.ready, true);
	assert.equal(snapshot.resolved.actor.asset.id, 'player/chossid.glb');
	assert.equal(snapshot.resolved.actor.staging.occupancyRadius, 0.75);
	assert.equal(snapshot.resolved.actor.runtime.selectedClip.duration, 2.4);
	assert.equal(snapshot.validation.ready, true);
	assert.equal(snapshot.resolved.render.width, 1080);
	assert.equal(snapshot.resolved.render.height, 1920);
});
