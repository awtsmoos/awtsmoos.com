// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiCompositions.test.mjs
 * @description Proves public composition authoring, history, persistence, locks, and structured failures.
 * The Awtsmoos renews project and revision together; Awtsmoos.com verifies agents can build
 * nested canvases, inspect exact plans, return through undo, and never bypass finite locks silently.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

const composition = id => ({ duration: 6, fps: 24, id, name: id });

test('public API creates, nests, evaluates, serializes, and restores compositions', () => {
	const { api, session } = createMovieStudioApiHarness();
	const initialRevision = session.revision;
	assert.equal(api.compositions.create(composition('child')).ok, true);
	assert.equal(api.compositions.layers.add('child', {
		duration: 6,
		id: 'title',
		kind: 'text',
		text: 'B\"H',
		transform: { x: 25 }
	}).ok, true);
	assert.equal(api.compositions.create({
		...composition('root'),
		layers: [{
			duration: 6,
			id: 'nested',
			kind: 'composition',
			sourceId: 'child'
		}]
	}).ok, true);
	assert.equal(session.revision, initialRevision + 3);
	assert.deepEqual(api.compositions.dependencies('root'), ['child']);
	assert.equal(api.compositions.evaluate('root', 2).layers[0].text, 'B\"H');
	const envelope = JSON.parse(api.project.serialize());
	assert.equal(envelope.project.compositions.length, 2);
	assert.equal(api.project.replace(envelope.project).ok, true);
	assert.equal(api.compositions.list().length, 2);
	assert.equal(Object.isFrozen(api.compositions.get('root').layers), true);
});

test('layer locks, revision guards, and graph failures return structured errors', () => {
	const { api, session } = createMovieStudioApiHarness();
	api.compositions.create(composition('locked'));
	api.compositions.layers.add('locked', {
		duration: 6,
		id: 'plate',
		kind: 'solid',
		locked: true
	});
	const locked = api.compositions.layers.update('locked', 'plate', { opacity: 0.5 });
	assert.equal(locked.ok, false);
	assert.equal(locked.error.code, 'MOVIE_COMPOSITION_LAYER_LOCKED');
	const forced = api.compositions.layers.update(
		'locked',
		'plate',
		{ opacity: 0.5 },
		{ force: true }
	);
	assert.equal(forced.ok, true);
	const stale = api.compositions.create(
		composition('stale'),
		{ expectedRevision: session.revision - 1 }
	);
	assert.equal(stale.ok, false);
	assert.equal(stale.error.code, 'STALE_MOVIE_REVISION');
	const cycle = api.compositions.create({
		...composition('cycle'),
		layers: [{ id: 'self', kind: 'composition', sourceId: 'cycle' }]
	});
	assert.equal(cycle.ok, false);
	assert.equal(cycle.error.code, 'MOVIE_COMPOSITION_CYCLE');
});

test('undo, redo, usage protection, and forced cleanup preserve graph integrity', () => {
	const { api } = createMovieStudioApiHarness();
	api.compositions.create(composition('child'));
	api.compositions.create({
		...composition('root'),
		layers: [{ id: 'nested', kind: 'composition', sourceId: 'child' }]
	});
	assert.equal(api.compositions.remove('child').error.code, 'MOVIE_COMPOSITION_IN_USE');
	assert.equal(api.history.undo().ok, true);
	assert.deepEqual(api.compositions.list().map(item => item.id), ['child']);
	assert.equal(api.history.redo().ok, true);
	assert.deepEqual(api.compositions.list().map(item => item.id), ['child', 'root']);
	assert.equal(api.compositions.remove('child', { force: true }).ok, true);
	assert.deepEqual(api.compositions.list().map(item => item.id), ['root']);
	assert.equal(api.compositions.get('root').layers.length, 0);
});
