// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCreativeCapabilityRegistry.test.mjs
 * @description Proves truthful statuses, immutable evidence, dependency closure, and cycle rejection.
 * The Awtsmoos transcends every catalog while finite claims require witnesses; Awtsmoos.com
 * verifies no agent can mutate evidence or call an unfinished creative workflow complete.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MovieCreativeCapabilityRegistry,
	movieCreativeCapabilityRegistry
} from '../../movie/MovieCreativeCapabilityRegistry.js';
import { validateMovieCreativeCapabilityStatus } from '../../movie/MovieCreativeCapabilityStatus.js';

const capability = (id, status = 'verified', dependencies = []) => ({
	category: 'test',
	dependencies,
	evidence: { tests: [`${id}.test.mjs`] },
	id,
	status,
	title: id
});

test('default registry exposes immutable truthful capability evidence', () => {
	const timeline = movieCreativeCapabilityRegistry.get('editing.timeline');
	const vector = movieCreativeCapabilityRegistry.get('vector.symbol-authoring');
	assert.equal(timeline.status, 'verified');
	assert.equal(vector.status, 'unavailable');
	assert.equal(Object.isFrozen(timeline.evidence.tests), true);
	assert.throws(() => timeline.evidence.tests.push('invented.test.mjs'), TypeError);
	assert.doesNotThrow(() => JSON.stringify(movieCreativeCapabilityRegistry.list()));
});

test('queries filter category, status, and normalized search', () => {
	const verified = movieCreativeCapabilityRegistry.list({ status: 'verified' });
	const dimensional = movieCreativeCapabilityRegistry.list({ category: 'three-dimensional' });
	const audio = movieCreativeCapabilityRegistry.list({ search: '  AUDIO  ' });
	assert.ok(verified.every(item => item.status === 'verified'));
	assert.deepEqual(dimensional.map(item => item.id), ['three-dimensional.authoring']);
	assert.deepEqual(audio.map(item => item.id), ['audio.mixing']);
});

test('workflow readiness lists every unfinished blocker', () => {
	const workflow = movieCreativeCapabilityRegistry.workflow('vector-animation');
	assert.equal(workflow.ready, false);
	assert.ok(workflow.blockers.includes('vector.symbol-authoring'));
	assert.ok(workflow.blockers.includes('audio.mixing'));
	assert.equal(Object.isFrozen(workflow.capabilities), true);
});

test('custom registry resolves dependency closure and rejects cycles', () => {
	const registry = new MovieCreativeCapabilityRegistry([
		capability('foundation'),
		capability('middle', 'partial', ['foundation']),
		capability('surface', 'experimental', ['middle'])
	], [{ capabilities: ['surface'], id: 'stack' }]);
	assert.deepEqual(registry.dependencies('surface'), ['middle', 'foundation']);
	assert.deepEqual(registry.workflow('stack').blockers, ['surface']);
	assert.throws(() => new MovieCreativeCapabilityRegistry([
		capability('left', 'partial', ['right']),
		capability('right', 'partial', ['left'])
	]), /dependency cycle/);
});

test('unknown statuses and identifiers fail explicitly', () => {
	assert.throws(() => validateMovieCreativeCapabilityStatus('done'), /Unknown/);
	assert.throws(() => movieCreativeCapabilityRegistry.get('not-real'), /Unknown/);
	assert.throws(() => movieCreativeCapabilityRegistry.workflow('not-real'), /Unknown/);
});
