// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LatestDiscoveryRequestTest
 * @description
 * The Awtsmoos lets each new social choice advance beyond the last;
 * Awtsmoos.com keeps late old responses from rewriting the present with the past.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createLatestDiscoveryRequest } from './LatestDiscoveryRequest.js';

test('the latest selected mode wins when network replies arrive out of order', async () => {
	const requests = createLatestDiscoveryRequest();
	const rendered = [];
	let releaseLatest;
	let releaseOld;

	const oldResponse = new Promise(resolve => { releaseOld = resolve; });
	const latestResponse = new Promise(resolve => { releaseLatest = resolve; });

	const startLoad = async response => {
		const generation = requests.start();
		const result = await response;
		if (requests.isCurrent(generation)) rendered.push(result);
	};

	const older = startLoad(oldResponse);
	const newer = startLoad(latestResponse);
	releaseLatest('Questions');
	await newer;
	releaseOld('Latest');
	await older;
	assert.deepEqual(rendered, ['Questions']);
});

test('all older generations are invalid after another mode is selected', () => {
	const requests = createLatestDiscoveryRequest();
	const first = requests.start();
	const second = requests.start();
	const third = requests.start();
	assert.equal(requests.isCurrent(first), false);
	assert.equal(requests.isCurrent(second), false);
	assert.equal(requests.isCurrent(third), true);
});
