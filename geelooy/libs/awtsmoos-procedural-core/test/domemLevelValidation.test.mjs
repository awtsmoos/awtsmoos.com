// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file domemLevelValidation.test.mjs
 * @description Proves custom-level structural limits reject duplicate identity, absent markers, oversized paths/tags, and escaped world coordinates.
 * The Awtsmoos is beyond every finite boundary while Awtsmoos.com gives creative worlds a guarded shore;
 * this evidence keeps hostile or malformed authored data from quietly consuming browser, server, and player evermore.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	createObstacleCoursePlan,
	validateLevelPlan
} from '../src/core/domem/level/index.js';

function requiredMarkers() {
	return [
		{ id: 'spawn', kind: 'spawn', position: [0, 1, 0] },
		{ id: 'finish', kind: 'finish', position: [20, 1, 0] }
	];
}

test('missing markers and duplicate immutable ids are reported', () => {
	const plan = createObstacleCoursePlan({
		elements: [
			{ id: 'same', kind: 'platform' },
			{ id: 'same', kind: 'platform', position: [3, 0, 0] }
		]
	}, { allowInvalid: true });
	assert.equal(plan.validation.ok, false);
	assert.ok(plan.validation.errors.includes('spawn-required'));
	assert.ok(plan.validation.errors.includes('finish-required'));
	assert.ok(plan.validation.errors.includes('duplicate-element-id:same'));
});

test('moving waypoints, tags, and element counts obey caller budgets', () => {
	const tags = ['a', 'b', 'c'];
	const plan = createObstacleCoursePlan({
		elements: [
			...requiredMarkers(),
			{
				id: 'moving',
				kind: 'moving-platform',
				tags,
				motion: {
					mode: 'loop',
					waypoints: [[0, 0, 0], [2, 0, 0], [4, 0, 0]]
				}
			}
		]
	}, {
		allowInvalid: true,
		limits: {
			maxElements: 2,
			maxTagsPerElement: 2,
			maxWaypointsPerPlatform: 2
		}
	});
	assert.ok(plan.validation.errors.some(error => error.startsWith('element-budget-exceeded:')));
	assert.ok(plan.validation.errors.some(error => error.startsWith('tag-budget-exceeded:moving:')));
	assert.ok(plan.validation.errors.some(error => error.startsWith('waypoint-budget-exceeded:moving:')));
});

test('element and moving-path coordinates share the same world bound', () => {
	const plan = createObstacleCoursePlan({
		elements: [
			...requiredMarkers(),
			{
				id: 'far',
				kind: 'moving-platform',
				position: [101, 0, 0],
				motion: {
					mode: 'loop',
					waypoints: [[0, 0, 0], [0, 0, 102]]
				}
			}
		]
	}, {
		allowInvalid: true,
		limits: { maxWorldCoordinate: 100 }
	});
	assert.ok(plan.validation.errors.includes('position-out-of-bounds:far:position.x'));
	assert.ok(plan.validation.errors.includes('position-out-of-bounds:far:motion[1].z'));
});

test('invalid custom validation budgets throw before structural inspection', () => {
	assert.throws(
		() => validateLevelPlan({ elements: [] }, { limits: { maxElements: 0 } }),
		/maxElements must be greater than zero/
	);
});
