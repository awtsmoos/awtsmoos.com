// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldDirectExperienceOrder.test.js
 * @description Proves the player's Bag never queues behind the optional creative dock.
 * The Awtsmoos sets the traveler's own pouch in his hand at once;
 * Awtsmoos.com must not make him wait for the painter's easel to unfold.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startMitzvahWorldDirectExperience } from './MitzvahWorldDirectExperience.js';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

test('direct-play starts before the creative dock settles', async () => {
	const events = [];
	const dependencies = {
		startCreativeDockPresentation: async () => {
			events.push('dock-invoked');
			await sleep(250);
			events.push('dock-settled');
			return 'dock-handle';
		},
		startDirectPlayPresentation: async () => {
			events.push('direct-play-invoked');
			return 'bag-handle';
		},
		startDirectWorldAudio: async () => {
			events.push('audio-invoked');
			return 'audio-handle';
		}
	};
	const receipt = await startMitzvahWorldDirectExperience(
		{ runtime: {} },
		{ setTimeout },
		dependencies
	);
	assert.equal(receipt.directPlayPresentation, 'bag-handle');
	assert.equal(receipt.presentation, 'dock-handle');
	assert.equal(receipt.audio, 'audio-handle');
	assert.ok(
		events.indexOf('direct-play-invoked') < events.indexOf('dock-settled'),
		`the Bag must start before the dock settles: ${events.join(',')}`
	);
	assert.ok(
		events.indexOf('audio-invoked') > events.indexOf('dock-settled'),
		`audio still follows the dock, as before: ${events.join(',')}`
	);
});

test('a creative dock that never settles cannot starve the Bag', async () => {
	let releaseDock = null;
	let directPlayInvocations = 0;
	const dependencies = {
		startCreativeDockPresentation: () => new Promise(resolve => {
			releaseDock = () => resolve('dock-handle');
		}),
		startDirectPlayPresentation: async () => {
			directPlayInvocations += 1;
			return 'bag-handle';
		},
		startDirectWorldAudio: async () => 'audio-handle'
	};
	const promise = startMitzvahWorldDirectExperience(
		{ runtime: {} },
		{ setTimeout },
		dependencies
	);
	await sleep(300);
	assert.equal(
		directPlayInvocations,
		1,
		'the Bag attempt must begin while the dock is still pending'
	);
	releaseDock();
	const receipt = await promise;
	assert.equal(receipt.directPlayPresentation, 'bag-handle');
	assert.equal(receipt.presentation, 'dock-handle');
});

test('a failing direct-play attempt still degrades alone', async () => {
	const dependencies = {
		startCreativeDockPresentation: async () => 'dock-handle',
		startDirectPlayPresentation: async () => {
			throw new Error('bag unavailable');
		},
		startDirectWorldAudio: async () => 'audio-handle'
	};
	const receipt = await startMitzvahWorldDirectExperience(
		{ runtime: {} },
		{ setTimeout },
		dependencies
	);
	assert.equal(receipt.directPlayPresentation, null);
	assert.equal(receipt.presentation, 'dock-handle');
	assert.equal(receipt.audio, 'audio-handle');
});
