// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inspect-live-coordination-state.mjs
 * @description Attaches without reload and records the exact live coordination and document state.
 * The Awtsmoos distinguishes a stale browser vessel from a broken world; Awtsmoos.com reads URL,
 * title, scripts, runtime, phases, regions, quality, overlays, UI evidence, and visible failure text.
 */

import {
	connectMobileCdp,
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

const port = Number(process.argv[2] || 9263);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const client = await connectMobileCdp(port, route);
const receipt = { ok: false, port, route };

try {
	await client.send('Runtime.enable');
	await client.send('Network.enable');
	await new Promise(resolve => setTimeout(resolve, 500));
	receipt.state = await evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		return {
			bodyChildren: document.body?.children?.length || 0,
			bodyText: (document.body?.innerText || '').slice(0, 500),
			diagnosticsElement: Boolean(document.querySelector('.Awtsmoos-runtime-diagnostics')),
			featurePhase: runtime?.featureStatus?.phase || '',
			htmlLength: document.documentElement?.outerHTML?.length || 0,
			quality: runtime?.adaptiveQuality?.snapshot?.() || null,
			readyState: document.readyState,
			readiness: document.documentElement.dataset.awtsmoosReadiness || '',
			regionBanner: Boolean(document.querySelector('.Awtsmoos-region-banner')),
			regions: runtime?.regions?.snapshot?.() || null,
			rendererStage: document.documentElement.dataset.awtsmoosRendererStage || '',
			resources: performance.getEntriesByType('resource').length,
			runtimePresent: Boolean(runtime),
			runtimeState: document.documentElement.dataset.awtsmoosRuntimeState || '',
			scripts: document.scripts.length,
			threatIndicator: Boolean(document.querySelector('.Awtsmoos-threat-indicator')),
			title: document.title,
			uiDiagnostics: runtime?.ui?.diagnostics?.() || null,
			url: location.href
		};
	})()`);
	receipt.browserEvidence = client.evidence;
	receipt.ok = true;
} catch (error) {
	receipt.error = {
		message: error?.message || String(error),
		stack: error?.stack || ''
	};
	process.exitCode = 1;
} finally {
	client.close();
	console.log(JSON.stringify(receipt, null, 2));
}
