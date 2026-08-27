// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file domemObstacleCoursePlanner.test.mjs
 * @description Proves one simple Domem call creates portable course truth and exposes it through the stable public material API.
 * The Awtsmoos is beyond course and caller while Awtsmoos.com lets one clear API gather platform, checkpoint, hazard, collectible, and finish;
 * game, Studio, server, and custom editor may share the same frozen definition before mutable gameplay begins.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import * as domem from '../src/core/domem/index.js';
import * as level from '../src/core/domem/level/index.js';

function courseInput() {
	return {
		id: 'kedem-trial',
		seed: 'kedem-613',
		theme: 'village-lava',
		title: 'Kedem Trial',
		elements: [
			{ id: 'spawn', kind: 'spawn', position: [0, 1, 0] },
			{ id: 'step', kind: 'platform', position: [0, 0, 4], size: [3, 0.5, 3] },
			{
				id: 'mover',
				kind: 'moving-platform',
				motion: {
					durationSeconds: 5,
					mode: 'ping-pong',
					waypoints: [[0, 2, 8], [6, 2, 8]]
				}
			},
			{ id: 'lava', kind: 'hazard', category: 'lava', position: [3, -1, 10], size: [12, 1, 16] },
			{ id: 'checkpoint-1', kind: 'checkpoint', sequence: 0, position: [6, 2, 12] },
			{ id: 'coin-1', kind: 'collectible', category: 'course-token', position: [8, 3, 14] },
			{ id: 'demon-gate', kind: 'encounter', tags: ['demon'], position: [10, 2, 16] },
			{ id: 'finish', kind: 'finish', position: [14, 2, 20] }
		]
	};
}

test('simple planner returns frozen valid content-addressed course definition', () => {
	const first = level.createObstacleCoursePlan(courseInput(), { source: 'premade' });
	const second = level.createObstacleCoursePlan(courseInput(), { source: 'premade' });
	assert.equal(first.validation.ok, true);
	assert.equal(first.contentHash, second.contentHash);
	assert.equal(first.schemaVersion, 1);
	assert.equal(first.elements.find(element => element.id === 'mover').kind, 'platform');
	assert.equal(first.elements.find(element => element.id === 'demon-gate').kind, 'encounter');
	assert.ok(first.difficulty.movingPlatformCount >= 1);
	assert.ok(first.difficulty.hazardCount >= 1);
	assert.equal(Object.isFrozen(first), true);
	assert.equal(Object.isFrozen(first.elements), true);
});

test('Domem public surface exposes the same obstacle-course planner authority', () => {
	assert.equal(domem.createObstacleCoursePlan, level.createObstacleCoursePlan);
	const plan = domem.createObstacleCoursePlan(courseInput());
	assert.equal(plan.id, 'kedem-trial');
	assert.equal(plan.kind, 'obstacle-course');
});
