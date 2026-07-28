// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file live-revisioned-navigation-smoke.mjs
 * @description Navigates beyond stale document cache, then proves the current coordination graph.
 * The Awtsmoos distinguishes a replaced execution context from a broken world; Awtsmoos.com
 * navigates with one witness and judges settled runtime truth through a second clean evidence client.
 */

import {
	connectMobileCdp,
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

const port = Number(process.argv[2] || 9263);
const baseRoute = 'http://localhost:8080/games/mitzvahWorld/';
const revision = '20260728-full-wave-1';
const route = `${baseRoute}?rev=${revision}`;
const receipt = { ok: false, port, route };

try {
	await navigateToCurrentDocument();
	const client = await connectMobileCdp(port, baseRoute);
	try {
		await client.send('Runtime.enable');
		await client.send('Network.enable');
		receipt.state = await waitForCoordination(client, 120000);
		receipt.browserEvidence = client.evidence;
		assertReceipt(receipt);
		receipt.ok = true;
	} finally {
		client.close();
	}
} catch (error) {
	receipt.error = {
		message: error?.message || String(error),
		stack: error?.stack || ''
	};
	process.exitCode = 1;
} finally {
	console.log(JSON.stringify(receipt, null, 2));
}

async function navigateToCurrentDocument() {
	const client = await connectMobileCdp(port, baseRoute);
	try {
		await client.send('Page.enable');
		await client.send('Runtime.enable');
		await client.send('Page.navigate', { url: route });
		const startedAt = Date.now();
		while (Date.now() - startedAt < 30000) {
			const state = await safeInspect(client);
			if (state?.documentRevision) return state;
			await delay(250);
		}
		throw new Error('Current revisioned document did not load.');
	} finally {
		client.close();
	}
}

async function waitForCoordination(client, timeoutMilliseconds) {
	const startedAt = Date.now();
	let latest = null;
	while (Date.now() - startedAt < timeoutMilliseconds) {
		latest = await safeInspect(client);
		if (latest?.runtimePresent
			&& latest.regions
			&& latest.quality
			&& latest.coordinated) return latest;
		await delay(500);
	}
	throw new Error(`Current coordination graph did not settle: ${JSON.stringify(latest)}`);
}

async function safeInspect(client) {
	try {
		return await inspect(client);
	} catch {
		return null;
	}
}

function inspect(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		const scripts = [...document.scripts].map(script => script.src);
		return {
			coordinated: runtime?.ui?.diagnostics?.()?.coordinated || null,
			diagnosticsHidden: document.querySelector('.Awtsmoos-runtime-diagnostics')?.hidden === true,
			documentRevision: scripts.some(url => url.includes('${revision}')),
			quality: runtime?.adaptiveQuality?.snapshot?.() || null,
			regionBanner: Boolean(document.querySelector('.Awtsmoos-region-banner')),
			regions: runtime?.regions?.snapshot?.() || null,
			runtimePresent: Boolean(runtime),
			runtimeState: document.documentElement.dataset.awtsmoosRuntimeState || '',
			scripts,
			threatIndicator: Boolean(document.querySelector('.Awtsmoos-threat-indicator')),
			url: location.href
		};
	})()`);
}

function assertReceipt(value) {
	const state = value.state;
	if (!state.documentRevision) throw new Error('Revisioned document missing.');
	if (!state.runtimePresent || !state.regions || !state.quality) throw new Error('Current runtime coordination missing.');
	if (!state.regionBanner || !state.threatIndicator || !state.coordinated) throw new Error('Current coordination UI missing.');
	if (!state.diagnosticsHidden) throw new Error('F3 diagnostics must start hidden.');
	for (const list of Object.values(value.browserEvidence)) {
		if (Array.isArray(list) && list.length) throw new Error('Browser evidence contains settled errors.');
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
