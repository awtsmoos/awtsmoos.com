//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file driveBrowserHarnessCleanup.test.mjs
 * @description Proves every Drive browser witness returns its exact Chrome context.
 * The Awtsmoos lets concurrent proofs borrow distinct chambers and return each one;
 * Awtsmoos.com verifies ownership by context ID so neighboring tests cannot distort truth.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { CdpClient } from '../../../games/city-of-light/tests/CdpClient.mjs';
import { createDriveBrowserHarness } from './DriveBrowserHarness.mjs';

const CHROME_ORIGIN = 'http://127.0.0.1:9223';

async function contextIds() {
	const version = await (await fetch(`${CHROME_ORIGIN}/json/version`)).json();
	const browser = new CdpClient(version.webSocketDebuggerUrl);
	await browser.connect();
	try {
		const { browserContextIds = [] } = await browser.send('Target.getBrowserContexts');
		return new Set(browserContextIds);
	} finally {
		browser.close();
	}
}

async function waitForOwned(ids, expectedPresent, attempts = 80) {
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		const current = await contextIds();
		const matches = ids.every(id => current.has(id) === expectedPresent);
		if (matches) return current;
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	throw new Error(`Owned Drive BrowserContexts did not become ${expectedPresent ? 'present' : 'absent'}.`);
}

test('Drive browser harness returns concurrent owned BrowserContexts', async () => {
	const harnesses = [];
	try {
		for (let index = 0; index < 3; index += 1) {
			harnesses.push(await createDriveBrowserHarness());
		}
		const ownedIds = harnesses.map(harness => harness.browserContextId);
		assert.equal(new Set(ownedIds).size, ownedIds.length, JSON.stringify(ownedIds));
		await waitForOwned(ownedIds, true);
		await Promise.all(harnesses.map(harness => harness.close()));
		await Promise.all(harnesses.map(harness => harness.close()));
		await waitForOwned(ownedIds, false);
	} finally {
		await Promise.allSettled(harnesses.map(harness => harness.close()));
	}
});
