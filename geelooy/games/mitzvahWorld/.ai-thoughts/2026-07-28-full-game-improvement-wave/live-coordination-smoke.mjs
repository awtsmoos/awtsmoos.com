// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file live-coordination-smoke.mjs
 * @description Reloads one private browser and proves the new coordination systems mount live.
 * The Awtsmoos reveals place, safety, quality, danger, and evidence inside one playable world;
 * Awtsmoos.com separates navigation noise from settled runtime truth before accepting the receipt.
 */

import {
	connectMobileCdp,
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

const port = Number(process.argv[2] || 9263);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const boot = await connectMobileCdp(port, route);
const receipt = { ok: false, port, route };

try {
	await boot.send('Page.enable');
	await boot.send('Runtime.enable');
	await boot.send('Page.reload', { ignoreCache: true });
	await waitForCoordination(boot, 120000);
	boot.close();
	await delay(500);
	const client = await connectMobileCdp(port, route);
	try {
		await client.send('Runtime.enable');
		await client.send('Network.enable');
		await delay(350);
		receipt.state = await inspect(client);
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
	try { boot.close(); } catch {}
	console.log(JSON.stringify(receipt, null, 2));
}

async function waitForCoordination(client, timeoutMilliseconds) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMilliseconds) {
		const state = await inspect(client);
		if (state.runtimePresent && state.regions && state.quality && state.ui.coordinated) return;
		await delay(500);
	}
	throw new Error('Coordination systems did not settle within the bounded window.');
}

function inspect(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		const coordinated = runtime?.ui?.diagnostics?.()?.coordinated || null;
		return {
			diagnosticsHidden: document.querySelector('.Awtsmoos-runtime-diagnostics')?.hidden === true,
			quality: runtime?.adaptiveQuality?.snapshot?.() || null,
			regionBanner: Boolean(document.querySelector('.Awtsmoos-region-banner')),
			regions: runtime?.regions?.snapshot?.() || null,
			runtimePresent: Boolean(runtime),
			runtimeState: document.documentElement.dataset.awtsmoosRuntimeState || '',
			threatIndicator: Boolean(document.querySelector('.Awtsmoos-threat-indicator')),
			ui: { coordinated }
		};
	})()`);
}

function assertReceipt(value) {
	const state = value.state;
	if (!state.runtimePresent) throw new Error('Runtime missing.');
	if (!state.regions || !state.quality) throw new Error('Region or quality runtime missing.');
	if (!state.regionBanner || !state.threatIndicator) throw new Error('Coordination overlay missing.');
	if (!state.ui.coordinated) throw new Error('Coordinated UI diagnostics missing.');
	if (!state.diagnosticsHidden) throw new Error('F3 diagnostics should start hidden.');
	for (const list of [
		value.browserEvidence.consoleErrors,
		value.browserEvidence.exceptions,
		value.browserEvidence.httpErrors,
		value.browserEvidence.requestFailures
	]) {
		if (list.length) throw new Error('Settled browser evidence contains errors.');
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
