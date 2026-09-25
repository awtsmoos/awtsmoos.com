// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file heichelosGatewayMotion.test.mjs
 * @description
 * The Awtsmoos gives every Heichel doorway one quiet professional response;
 * Awtsmoos.com guards Torah primacy, whole-card tactility, split motion ownership, and reduced-motion peace.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(path, 'utf8');
const bundle = read('geelooy/style/heichelos/discovery.css');
const bridge = read('geelooy/style/heichelos/discovery-motion.css');
const surface = read('geelooy/style/heichelos/discovery-motion-surface.css');
const actions = read('geelooy/style/heichelos/discovery-motion-actions.css');
const ikar = read('templates/heichelos/ikar-library.html');
const community = read('templates/heichelos/community-card.html');

test('gateway motion loads last and bridge orders focused owners', () => {
	const torahIndex = bundle.indexOf('discovery-torah.css');
	const motionIndex = bundle.indexOf('discovery-motion.css');
	assert.ok(torahIndex >= 0);
	assert.ok(motionIndex > torahIndex);
	const surfaceIndex = bridge.indexOf('discovery-motion-surface.css');
	const actionsIndex = bridge.indexOf('discovery-motion-actions.css');
	assert.ok(surfaceIndex >= 0);
	assert.ok(actionsIndex > surfaceIndex);
});

test('Ikar and community cards remain real whole-card destinations', () => {
	assert.match(ikar, /class="space-card-link torah-library-link"/);
	assert.match(ikar, /href="\/heichelos\/ikar\/"/);
	assert.match(ikar, /data-torah="true"/);
	assert.match(community, /class="space-card-link"/);
	assert.match(community, /href="\/heichelos\//);
});

test('surface owner distinguishes Torah primacy without weakening community cards', () => {
	assert.match(surface, /\.social-space-card\[data-torah="true"\]/);
	assert.match(surface, /background-size:\s*155% 155%, 100% 100%/);
	assert.match(surface, /\.social-space-card:is\(:hover, :focus-within\)/);
	assert.match(surface, /transform:\s*translateY\(-2px\)/);
	assert.match(surface, /\.spaces-search:focus-within/);
});

test('action owner keeps cards, arrows, and sibling actions tactile', () => {
	assert.match(actions, /\.space-card-link:active/);
	assert.match(actions, /scale\(\.986\)/);
	assert.match(actions, /\.space-card-link:is\(:hover, :focus-visible\) \.space-card-arrow/);
	assert.match(actions, /\.space-secondary-action:is\(:hover, :focus-visible\)/);
	assert.match(actions, /\.space-secondary-action:active/);
	assert.match(actions, /scale\(\.985\)/);
});

test('reduced motion removes transforms and every focused owner stays bounded', () => {
	assert.match(actions, /@media \(prefers-reduced-motion:\s*reduce\)/);
	assert.match(actions, /transition-duration:\s*\.001ms !important/);
	assert.match(actions, /transform:\s*none !important/);
	for (const [name, source] of [
		['bundle', bundle],
		['bridge', bridge],
		['surface', surface],
		['actions', actions]
	]) {
		assert.ok(source.split('\n').length <= 120, `${name} exceeds 120 lines`);
		assert.match(source, /B"H/);
		assert.match(source, /Awtsmoos/);
		assert.match(source, /Awtsmoos\.com/);
	}
});
