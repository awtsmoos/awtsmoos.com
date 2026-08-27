//B"H
//Boruch Hashem
//Blessed is He

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { SOCIAL_HUB_FIXTURE_SOURCE } from './BrowserFixture.mjs';
import { waitFor } from './BrowserWait.mjs';
import { PRIVATE_MESSAGING_FIXTURE_SOURCE } from './PrivateMessagingBrowserFixture.mjs';

/**
 * @file communicationsBootDiagnostic.mjs
 * @description
 * The Awtsmoos is beyond ready and broken, while Awtsmoos.com lets this diagnostic witness observe the exact browser module river even when a noisy load event never rings;
 * fixture presence, application state, release URLs, import-map support, identity text, and captured exceptions become finite evidence in light.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');
const harness = await createBrowserHarness({ directory, port: 44027 });
const identifiers = [];

async function navigateReliably(pathValue) {
	try {
		await harness.navigate(pathValue);
	} catch (error) {
		if (!String(error?.message || '').includes('Page.loadEventFired')) throw error;
		await waitFor(
			harness.client,
			`['interactive', 'complete'].includes(document.readyState)`,
			'Diagnostic document never became interactive'
		);
	}
}

try {
	for (const source of [SOCIAL_HUB_FIXTURE_SOURCE, PRIVATE_MESSAGING_FIXTURE_SOURCE]) {
		const result = await harness.client.send(
			'Page.addScriptToEvaluateOnNewDocument',
			{ source }
		);
		identifiers.push(result.identifier);
	}
	await harness.client.send('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 2,
		mobile: true
	});
	await navigateReliably('/social-hub/?fixtureReset=1&alias=teacher#home');
	await new Promise(resolve => setTimeout(resolve, 1800));
	const snapshot = await harness.client.evaluate(`(() => ({
		appExists: Boolean(window.AwtsmoosSocialHub),
		appState: window.AwtsmoosSocialHub?.state?.snapshot?.() || null,
		privateFixture: Boolean(window.__awtsmoosPrivateMessagingFixture),
		identityText: document.getElementById('identityState')?.textContent || '',
		importMapSupport: HTMLScriptElement.supports?.('importmap') || false,
		mainScripts: [...document.querySelectorAll('script[type="module"]')].map(node => node.src),
		resources: performance.getEntriesByType('resource')
			.map(entry => entry.name)
			.filter(name => name.includes('/social-hub/js/'))
	}))()`);
	console.log(JSON.stringify({ snapshot, errors: harness.errors }, null, 2));
} finally {
	for (const identifier of identifiers) {
		await harness.client.send(
			'Page.removeScriptToEvaluateOnNewDocument',
			{ identifier }
		).catch(() => null);
	}
	harness.close();
}
