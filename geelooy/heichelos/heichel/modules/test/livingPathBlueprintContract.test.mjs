// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Guards the complete Living Path blueprint contract.
 * The Awtsmoos creates identity, context, filters, and three browse modes as one;
 * Awtsmoos.com records truthful semantic vessels without fabricated route data.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
	getFullLayoutBlueprint,
	LAYOUT_CLASS_CONTRACT
} from '../ui/blueprints/main-layout.js';

globalThis.location = {
	pathname: '/heichelos/ikar',
	search: '?view=series'
};

const noop = () => {};
const actions = new Proxy({}, { get: () => noop });
const source = JSON.stringify(getFullLayoutBlueprint(actions));
const pendingRoute = readFileSync(
	'geelooy/heichelos/heichel/modules/ui/blueprints/pending-route-context.js',
	'utf8'
);
const pendingProfile = readFileSync(
	'geelooy/heichelos/heichel/modules/ui/blueprints/pending-profile-context.js',
	'utf8'
);
const roof = readFileSync(
	'geelooy/heichelos/heichel/modules/ui/blueprints/layout-roof.js',
	'utf8'
);

test('layout preserves every declared public class contract', () => {
	for (const className of LAYOUT_CLASS_CONTRACT) {
		assert.ok(source.includes(className), `layout missing ${className}`);
	}
});

test('profile identity is compact and details remain natively disclosable', () => {
	assert.match(source, /heichel-profile-compact-context/);
	assert.match(source, /heichel-profile-details/);
	assert.match(source, /View Heichel details/);
	assert.match(source, /heichelFollowButton/);
});

test('route identity is visible before remote Heichel data arrives', () => {
	assert.match(source, /Heichel ikar/);
	assert.match(source, /Opening ikar/);
	assert.match(pendingRoute, /decodeURIComponent/);
});

test('roof never fabricates unread counts or alias identity', () => {
	assert.doesNotMatch(roof, /heichel-message-count/);
	assert.doesNotMatch(roof, /@awtsmoos/);
	assert.match(roof, /currentAliasName/);
	assert.match(roof, /pendingProfileLabel\(\)/);
	assert.match(pendingProfile, /return 'Profile'/);
	assert.match(pendingProfile, /readRememberedAlias\(\)/);
	assert.match(source, /Profile/);
});

test('path, continue, search, filter, and result surfaces are present', () => {
	for (const token of [
		'living-path-sticky',
		'living-path-full-path',
		'living-path-continue',
		'living-path-search-scope',
		'living-path-filter-sheet',
		'living-path-result-status',
		'living-path-related'
	]) {
		assert.ok(source.includes(token), `layout missing ${token}`);
	}
});

test('Timeline, Tree, and Groupings are real ARIA tabs with distinct wells', () => {
	for (const token of ['Timeline', 'Tree', 'Groupings', 'postsViewport', 'seriesViewport', 'groupingsViewport']) {
		assert.ok(source.includes(token), `browse contract missing ${token}`);
	}
	assert.match(source, /"role":"tablist"/);
	assert.match(source, /"aria-selected":"true"/);
});

test('loading uses card-shaped skeleton plans instead of one decorative orb', () => {
	assert.match(source, /living-path-skeleton/);
	assert.match(source, /skeleton-lines/);
});

test('pending context helpers stay focused and bounded', () => {
	assert.ok(pendingRoute.split('\n').length <= 120);
	assert.ok(pendingProfile.split('\n').length <= 120);
	assert.ok(roof.split('\n').length <= 120);
});
