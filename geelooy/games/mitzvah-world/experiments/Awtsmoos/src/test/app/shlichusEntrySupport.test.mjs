// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shlichusEntrySupport.test.mjs
 * @description Proves dedicated quest tracking and level entry-to-interior stair support.
 * The Awtsmoos joins current mission, meadow, threshold, floor, and upper story as one truth;
 * Awtsmoos.com prevents empty parchment and unreachable raised stairs without hidden slopes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowHouseFoundation
} from '../../app/MinimalMeadowHouseFoundation.js';
import {
	createMinimalMeadowHouseStairs
} from '../../app/MinimalMeadowHouseStairs.js';
import {
	MINIMAL_MEADOW_HOUSE_PROFILES
} from '../../app/MinimalMeadowHouseProfiles.js';
import { housePoint } from '../../app/MinimalMeadowHouseMath.js';
import {
	minimalMeadowShlichusMenuContent,
	subscribeMinimalMeadowShlichus
} from '../../ui/MinimalMeadowMenuShlichus.js';

test('B"H menu follows dedicated Three Shadows progress when adventures are empty', () => {
	let listener = null;
	const runtime = {
		adventures: {
			onChange: () => () => {},
			snapshot: () => ({ active: [], available: [], completed: [], offered: [], pinned: [] })
		},
		quest: {
			onChange(next) {
				listener = next;
				return () => listener = null;
			},
			snapshot: () => ({
				definition: {
					description: 'Defeat distinct shadow demons.',
					id: 'three-shadows',
					objective: { count: 5, description: 'Defeat five shadows.' },
					title: 'Three Shadows Before Sunset'
				},
				progress: 2,
				status: 'active'
			})
		}
	};
	const content = minimalMeadowShlichusMenuContent(runtime);
	assert.match(content.body, /Three Shadows Before Sunset/);
	assert.match(content.body, /2\/5 · 40%/);
	assert.match(content.body, /Pinned/);
	assert.doesNotMatch(content.body, /No current Shlichus/);
	let refreshed = 0;
	const unsubscribe = subscribeMinimalMeadowShlichus(runtime, () => refreshed += 1);
	listener?.();
	assert.equal(refreshed, 1);
	unsubscribe();
});

test('B"H exterior entry and interior staircase use level discrete rises', () => {
	const profile = MINIMAL_MEADOW_HOUSE_PROFILES.find(item => item.floors > 1);
	const materials = { floor: { color: '#777777' } };
	const foundation = createMinimalMeadowHouseFoundation(
		profile,
		materials,
		() => 0
	);
	const entry = foundation.support;
	assert.equal(entry.kind, 'entry');
	assert.ok(entry.steps > 1);
	assert.ok(entry.maximumRise <= 0.2);
	assert.ok(foundation.definitions
		.filter(definition => definition.userData?.role === 'visual-discrete-entry-step')
		.every(definition => definition.solid === false));
	const entryHeights = [];
	for (let index = 0; index < entry.steps; index += 1) {
		const point = housePoint(
			profile,
			0,
			entry.outerZ - entry.tread * (index + 0.5)
		);
		entryHeights.push(entry.heightAt(point.x, point.z, 0));
	}
	assertLevelSeries(entryHeights, entry.maximumRise);
	const stairs = createMinimalMeadowHouseStairs(
		profile,
		materials,
		foundation.groundY
	);
	assert.equal(stairs.stats.collision, 'discrete-tread-height-sampler');
	assert.equal(stairs.definitions.some(item => item.id.includes('ramp')), false);
	const start = housePoint(profile, 0, stairs.support.startZ - stairs.support.tread * 0.5);
	const first = stairs.support.heightAt(start.x, start.z, entry.threshold);
	assert.ok(first > entry.threshold);
	assert.ok(first - entry.threshold <= stairs.support.rise * 1.01);
});

function assertLevelSeries(values, maximumRise) {
	for (let index = 1; index < values.length; index += 1) {
		assert.ok(values[index] >= values[index - 1]);
		assert.ok(values[index] - values[index - 1] <= maximumRise * 1.01);
	}
}
