// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { CdpSession } from './browser/CdpSession.js';
import { BrowserReadiness } from './browser/BrowserReadiness.js';

/**
 * The browser is the final witness for a real tool. The Awtsmoos renews controls,
 * preview, JSON, and stage state; this proof waits for the actual Character Lab
 * before testing proposal, explicit approval, and scene insertion.
 */
const cdpOrigin = process.env.AWTSMOOS_CDP_ORIGIN || 'http://127.0.0.1:9222';
const appUrl = process.env.AWTSMOOS_ANIMATOR_URL
	|| 'http://127.0.0.1:4173/geelooy/apps/animator/';
const response = await fetch(
	`${cdpOrigin}/json/new?${encodeURIComponent(appUrl)}`,
	{ method: 'PUT' }
);

assert.equal(response.ok, true);
const target = await response.json();
const session = await new CdpSession(target.webSocketDebuggerUrl).connect();

try {
	await enable(session);
	await session.send('Page.navigate', {
		url: `${appUrl}?customizer-proof=${Date.now()}`
	});
	const readiness = await BrowserReadiness.wait(
		session,
		`(() => {
			const root = document.getElementById('character-customizer');
			return {
				ready: Boolean(
					root
					&& root.querySelector('canvas')
					&& root.querySelector('[data-character-json]')
					&& root.querySelectorAll('[data-character-path]').length >= 30
				),
				bodyText: document.body?.innerText || '',
				canvases: [...document.querySelectorAll('canvas')]
			};
		})()`,
		{ attempts: 60, intervalMs: 500 }
	);
	assert.equal(readiness?.ready, true, 'Character Lab did not become ready.');
	const result = await session.evaluate(proofExpression());
	const exceptions = session.events.filter(event => (
		event.method === 'Runtime.exceptionThrown'
	));
	const severeLogs = session.events.filter(event => (
		event.method === 'Log.entryAdded'
		&& ['error', 'warning'].includes(event.params?.entry?.level)
	));

	assertResult(result, exceptions, severeLogs);
	console.log(JSON.stringify({ ok: true, ...result }, null, 2));
} finally {
	session.close();
}

async function enable(session) {
	await session.send('Page.enable');
	await session.send('Runtime.enable');
	await session.send('Log.enable');
	await session.send('Network.enable');
	await session.send('Network.setCacheDisabled', { cacheDisabled: true });
}

function proofExpression() {
	return `(async () => {
		const root = document.getElementById('character-customizer');
		root.querySelector('[data-character-toggle]').click();
		const prompt = root.querySelector('[data-character-ai]');
		prompt.value = 'An energetic tall woman named Talia with deep brown skin, long braids, a purple hoodie, warm voice, and joyful expressions.';
		root.querySelector('[data-character-propose]').click();
		await new Promise(resolve => setTimeout(resolve, 500));
		const proposed = JSON.parse(root.querySelector('[data-character-json]').value);
		root.querySelector('[data-character-apply]').click();
		await new Promise(resolve => setTimeout(resolve, 120));
		const characters = window.__AWTSMOOS_PARK_APP__?.state?.get?.('characters') || {};
		return {
			open: root.dataset.open,
			fieldCount: root.querySelectorAll('[data-character-path]').length,
			groups: [...root.querySelectorAll('legend')].map(item => item.textContent),
			provider: proposed.ai.provider,
			approvedInForm: proposed.ai.approved,
			name: proposed.name,
			genderPresentation: proposed.genderPresentation,
			hair: proposed.hair,
			stateCharacter: characters[proposed.id] || null,
			previewBytes: root.querySelector('canvas').toDataURL().length,
			styleLoaded: Boolean(document.querySelector('link[data-character-lab-style]'))
		};
	})()`;
}

function assertResult(result, exceptions, severeLogs) {
	assert.equal(result.open, 'true');
	assert.ok(result.fieldCount >= 30);
	assert.ok(result.groups.includes('Facial Hair'));
	assert.ok(result.groups.includes('Voice & Movement'));
	assert.equal(result.provider, 'local-deterministic-fallback');
	assert.equal(result.approvedInForm, false);
	assert.equal(result.name, 'Talia');
	assert.equal(result.genderPresentation, 'feminine');
	assert.equal(result.hair.length, 'long');
	assert.ok(result.stateCharacter?.aiDesign?.approved);
	assert.ok(result.previewBytes > 1000);
	assert.equal(result.styleLoaded, true);
	assert.equal(exceptions.length, 0);
	assert.equal(severeLogs.length, 0);
}
