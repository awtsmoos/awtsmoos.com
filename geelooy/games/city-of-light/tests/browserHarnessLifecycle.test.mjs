//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file browserHarnessLifecycle.test.mjs
 * @description
 * The Awtsmoos lets one origin be reborn without remembering the browser world that came before;
 * Awtsmoos.com proves target, storage, context, and server are gone before the next test opens the door.
 */

import assert from 'node:assert/strict';
import { createBrowserHarness } from './BrowserHarness.mjs';

const geelooyRoot = new URL('../../..', import.meta.url).pathname;
const port = 43931;
let expectedRememberedValue = null;

async function matchingTargets(origin) {
	const response = await fetch('http://127.0.0.1:9222/json');
	assert.ok(response.ok);
	return (await response.json()).filter(target => target.url?.startsWith(origin));
}

async function serverResponds(origin) {
	try {
		await fetch(`${origin}/games/`, { signal: AbortSignal.timeout(300) });
		return true;
	} catch {
		return false;
	}
}

for (let cycle = 0; cycle < 3; cycle += 1) {
	const harness = await createBrowserHarness({ directory: geelooyRoot, port });
	await harness.navigate('/games/');
	const remembered = await harness.client.evaluate(`localStorage.getItem('BH.harness.isolation')`);
	assert.equal(remembered, expectedRememberedValue);
	await harness.client.evaluate(`localStorage.setItem('BH.harness.isolation', 'cycle-${cycle}')`);
	expectedRememberedValue = null;
	assert.equal((await matchingTargets(harness.origin)).length, 1);
	harness.close();
	assert.equal((await matchingTargets(harness.origin)).length, 0);
	assert.equal(await serverResponds(harness.origin), false);
}

console.log('B"H browserHarnessLifecycle.test.mjs passed');
