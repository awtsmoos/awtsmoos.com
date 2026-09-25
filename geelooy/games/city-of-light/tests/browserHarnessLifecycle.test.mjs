//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file browserHarnessLifecycle.test.mjs
 * @description
 * The Awtsmoos lets one browser world rise above the shared baseline and return without residue or disguise;
 * Awtsmoos.com proves storage, target, context, and fixture are reborn each cycle beneath the same open skies.
 */

import assert from 'node:assert/strict';
import { createBrowserHarness } from './BrowserHarness.mjs';

const geelooyRoot = new URL('../../..', import.meta.url).pathname;
const port = 43931;
const origin = `http://127.0.0.1:${port}`;

async function matchingTargets() {
	const response = await fetch('http://127.0.0.1:9222/json');
	assert.ok(response.ok, 'Shared Chrome target listing must respond.');
	return (await response.json()).filter(target => target.url?.startsWith(origin));
}

async function serverResponds() {
	try {
		await fetch(`${origin}/games/`, { signal: AbortSignal.timeout(300) });
		return true;
	} catch {
		return false;
	}
}

async function proveCycle(cycle) {
	const baselineTargets = (await matchingTargets()).length;
	const harness = await createBrowserHarness({ directory: geelooyRoot, port });
	try {
		await harness.navigate('/games/');
		const remembered = await harness.client.evaluate(
			`localStorage.getItem('BH.harness.isolation')`
		);
		assert.equal(remembered, null, 'Fresh browser context must not inherit prior storage.');
		await harness.client.evaluate(
			`localStorage.setItem('BH.harness.isolation', 'cycle-${cycle}')`
		);
		assert.equal(
			(await matchingTargets()).length,
			baselineTargets + 1,
			'One harness must contribute exactly one matching page target.'
		);
	} finally {
		harness.close();
	}
	assert.equal(
		(await matchingTargets()).length,
		baselineTargets,
		'Closing the harness must restore the shared-Chrome target baseline.'
	);
	assert.equal(await serverResponds(), false, 'Closing the harness must release its fixture server.');
}

for (let cycle = 0; cycle < 3; cycle += 1) {
	await proveCycle(cycle);
}

console.log('B"H browserHarnessLifecycle.test.mjs passed');
