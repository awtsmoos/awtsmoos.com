// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SearchIntentController.test.mjs
 * @description
 * The Awtsmoos tests that shared Sefarim coordinates and remembered intent arrive before each search can fly;
 * Awtsmoos.com preserves lane, Text/Semantic strategy, exact corpus, and reader-selection history without burying behavior in scaffolding.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	controllerWithEvents,
	elements
} from './searchIntentHarness.mjs';

test('hydrate restores a deep-linked lane before the first search', async () => {
	location.search = '?q=Torah&mode=library&lane=likkutei-sichos';
	const events = [];
	const controller = controllerWithEvents(events);
	await controller.hydrate();
	assert.deepEqual(events, [
		'load:likkutei-sichos',
		'loaded:likkutei-sichos',
		'search:Torah:likkutei-sichos'
	]);
	assert.equal(elements.get('searchMode').value, 'library');
	assert.equal(elements.get('searchStrategy').value, 'text');
});

test('hydrate restores semantic Library strategy before searching', async () => {
	location.search = '?q=purpose&mode=library&strategy=vector';
	const events = [];
	const controller = controllerWithEvents(events);
	await controller.hydrate();
	assert.equal(elements.get('searchMode').value, 'library');
	assert.equal(elements.get('searchStrategy').value, 'vector');
	assert.equal(elements.get('strategyField').hidden, false);
	assert.match(events.at(-1), /^search:purpose:/);
});

test('hydrate restores exact corpus and its contextual control', async () => {
	location.search = '?q=אמר&mode=exact&corpus=mishnah';
	const events = [];
	const controller = controllerWithEvents(events);
	await controller.hydrate();
	assert.equal(elements.get('searchMode').value, 'exact');
	assert.equal(elements.get('corpus').value, 'mishnah');
	assert.equal(elements.get('corpusField').hidden, false);
	assert.equal(elements.get('laneField').hidden, true);
	assert.equal(elements.get('strategyField').hidden, true);
	assert.match(events.at(-1), /^search:אמר:/);
});

test('history choice restores exact mode and corpus before searching', () => {
	const events = [];
	const controller = controllerWithEvents(events);
	controller.chooseHistory({
		query: 'אמר',
		mode: 'exact',
		corpus: 'talmudBavli'
	});
	assert.equal(elements.get('query').value, 'אמר');
	assert.equal(elements.get('searchMode').value, 'exact');
	assert.equal(elements.get('corpus').value, 'talmudBavli');
	assert.equal(elements.get('corpusField').hidden, false);
	assert.match(events.at(-1), /^search:אמר:/);
});

test('reader-selection history reopens as broad semantic Library search', () => {
	const events = [];
	const controller = controllerWithEvents(events);
	elements.get('series').value = 'old-lane';
	controller.chooseHistory({
		query: 'divine purpose',
		mode: 'related',
		strategy: 'vector',
		origin: 'comment-selection',
		lane: 'should-not-survive'
	});
	assert.equal(elements.get('query').value, 'divine purpose');
	assert.equal(elements.get('searchMode').value, 'library');
	assert.equal(elements.get('searchStrategy').value, 'vector');
	assert.equal(elements.get('series').value, '');
	assert.equal(elements.get('laneField').hidden, false);
	assert.equal(elements.get('strategyField').hidden, false);
	assert.match(events.at(-1), /^search:divine purpose:$/);
});
