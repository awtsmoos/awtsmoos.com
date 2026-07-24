// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Proves the pure Living Path policies of Awtsmoos.com.
 * The Awtsmoos creates language, path, chronology, query, and quiet states;
 * these tests witness finite outputs without DOM, network, or storage dependence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	detectDirection,
	detectLanguage
} from '../living-path/language-policy.js';
import {
	compactPath,
	normalizePath,
	searchPlaceholder
} from '../living-path/path-policy.js';
import { bucketTimeline } from '../living-path/timeline-policy.js';
import {
	activeFilterCount,
	filterLoadedContent,
	visibleCounts
} from '../living-path/filter-policy.js';
import { describeEmptyState } from '../living-path/empty-state-policy.js';

const now = Date.UTC(2026, 6, 24, 12);

test('language policy requires dominant Hebrew instead of one stray letter', () => {
	assert.equal(detectLanguage('מסכת מידות בבית המקדש'), 'he');
	assert.equal(detectDirection('מסכת מידות בבית המקדש'), 'rtl');
	assert.equal(detectLanguage('English teaching with א citation'), 'en');
});

test('path policy removes duplicate roots and derives compact context', () => {
	const path = normalizePath([
		{ id: 'root', name: 'Root' },
		{ id: 'oral', name: 'Oral Torah' },
		{ id: 'mishnah', name: 'Mishnah' }
	], { id: 'middos', name: 'מדות' });
	assert.deepEqual(path.map(item => item.id), ['root', 'oral', 'mishnah', 'middos']);
	assert.equal(compactPath(path).parent.name, 'Mishnah');
	assert.equal(searchPlaceholder(path, 'series'), 'Search series inside מדות');
});

test('timeline policy keeps real dates and an explicit undated shelf', () => {
	const sections = bucketTimeline([
		{ id: 'today', timestamp: now - 1000 },
		{ id: 'week', timestamp: now - 3 * 86400000 },
		{ id: 'old', timestamp: now - 20 * 86400000 },
		{ id: 'unknown', timestamp: null }
	], now);
	assert.deepEqual(sections.map(section => section.label), [
		'Today',
		'This week',
		'Earlier',
		'Undated teachings'
	]);
});

test('filter policy combines query, kind, language, scope, and sorting', () => {
	const content = {
		posts: [
			{ id: 'new-question', title: 'Digital privacy', postType: 'question', createdAt: now },
			{ id: 'hebrew', title: 'מסכת מידות בבית המקדש', createdAt: now - 1000 },
			{ id: 'old-post', title: 'Ancient source', createdAt: now - 100000 }
		],
		subSeries: [{ id: 'privacy-series', name: 'Privacy sources' }],
		groupings: []
	};
	const filtered = filterLoadedContent(content, {
		query: 'privacy',
		searchScope: 'branch',
		currentView: 'posts',
		filters: { kinds: ['question'], language: 'en', sort: 'newest' }
	});
	assert.deepEqual(filtered.posts.map(item => item.id), ['new-question']);
	assert.deepEqual(filtered.subSeries, []);
	assert.deepEqual(visibleCounts(filtered), { posts: 1, series: 0, groupings: 0 });
	assert.equal(activeFilterCount({ kinds: ['question'], language: 'he', sort: 'oldest' }), 3);
});

test('empty-state policy distinguishes search, filters, series, and groupings', () => {
	const livingPath = { query: 'missing', committedFilters: {} };
	assert.equal(describeEmptyState({ view: 'posts', state: { livingPath } }).action, 'clear-search');
	livingPath.query = '';
	livingPath.committedFilters = { kinds: ['audio'], language: 'all', sort: 'newest' };
	assert.equal(describeEmptyState({ view: 'posts', state: { livingPath } }).action, 'reset-filters');
	livingPath.committedFilters = {};
	assert.equal(describeEmptyState({ view: 'series', state: { livingPath }, sourceContent: { posts: [{}] } }).action, 'view-posts');
	assert.equal(describeEmptyState({ view: 'groupings', state: { livingPath } }).title, 'No alternate groupings yet');
});
