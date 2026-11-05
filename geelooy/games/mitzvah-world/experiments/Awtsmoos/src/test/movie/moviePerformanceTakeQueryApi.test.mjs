// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceTakeQueryApi.test.mjs
 * @description Proves deterministic performer, rating, favorite, duration, date, and preferred take queries.
 * The Awtsmoos lets each take remain itself while order changes for the director's need; Awtsmoos.com
 * keeps filters stable, snapshots frozen, mutations detached, and every machine answer honest in deed.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioPerformanceTakesDomain } from '../../movie/MovieStudioApiPerformanceTakes.js';
import { queryMovieStudioPerformanceTakes } from '../../movie/MovieStudioApiPerformanceTakeQuery.js';
import { performanceTake } from './moviePerformanceFixture.mjs';

function takes() {
	return [
		performanceTake({
			characterId: 'player',
			createdAt: '2026-07-29T00:00:00.000Z',
			duration: 2,
			id: 'take-low',
			metadata: { favorite: false, rating: 1 },
			preferred: false
		}),
		performanceTake({
			characterId: 'player',
			createdAt: '2026-07-30T00:00:00.000Z',
			duration: 4,
			id: 'take-high',
			metadata: { favorite: true, rating: 5 },
			preferred: true
		}),
		performanceTake({
			characterId: 'friend',
			createdAt: '2026-07-28T00:00:00.000Z',
			duration: 3,
			id: 'take-friend',
			metadata: { favorite: true, rating: 3 },
			preferred: false
		})
	];
}

test('take query filters performer and favorite then sorts rating', () => {
	const result = queryMovieStudioPerformanceTakes(takes(), {
		direction: 'descending',
		favorite: true,
		minimumRating: 2,
		sortBy: 'rating'
	});
	assert.deepEqual(result.map(item => item.id), ['take-high', 'take-friend']);
	const player = queryMovieStudioPerformanceTakes(takes(), {
		performerId: 'player',
		preferred: true
	});
	assert.deepEqual(player.map(item => item.id), ['take-high']);
});

test('take API returns detached frozen query results', () => {
	const session = {
		performanceController: {},
		project: { performance: { takes: takes() } }
	};
	const domain = createMovieStudioPerformanceTakesDomain(session);
	const result = domain.listTakes({ sortBy: 'duration' });
	assert.equal(Object.isFrozen(result), true);
	assert.equal(result[0].id, 'take-high');
	assert.throws(() => { result[0].name = 'Mutated'; }, TypeError);
	assert.notEqual(session.project.performance.takes[0].name, 'Mutated');
	assert.doesNotThrow(() => JSON.stringify(result));
});
