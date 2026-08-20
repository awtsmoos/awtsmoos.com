// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file historyGroups.test.mjs
 * @description
 * The Awtsmoos tests that a long local search journey keeps its chronological shape across years, months, and days;
 * Awtsmoos.com may collapse the archive visually, but never mix one calendar vessel with another.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { groupHistoryByDate } from '../historyGroups.js';

function entry(query, iso) {
	return {
		query,
		visitedAt: new Date(iso).getTime()
	};
}

test('history groups newest entries into year month and day hierarchy', () => {
	const groups = groupHistoryByDate([
		entry('newest', '2026-08-20T08:00:00Z'),
		entry('same day', '2026-08-20T07:00:00Z'),
		entry('prior month', '2026-07-03T12:00:00Z'),
		entry('prior year', '2025-12-31T12:00:00Z')
	]);

	assert.deepEqual(groups.map(group => group.label), ['2026', '2025']);
	assert.deepEqual(groups[0].months.map(month => month.label), ['August', 'July']);
	assert.equal(groups[0].months[0].days[0].entries.length, 2);
	assert.equal(groups[0].months[0].days[0].entries[0].query, 'newest');
	assert.equal(groups[1].months[0].days[0].entries[0].query, 'prior year');
});
