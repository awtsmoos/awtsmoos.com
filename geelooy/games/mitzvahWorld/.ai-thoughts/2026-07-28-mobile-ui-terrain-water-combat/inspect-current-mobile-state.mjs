// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inspect-current-mobile-state.mjs
 * @description Attaches without reload and records the page, runtime markers, and fresh browser evidence.
 * The Awtsmoos distinguishes an absent marker from an absent world; Awtsmoos.com reads title,
 * document, scripts, runtime, readiness, error surfaces, and resources before judging startup truth.
 */

import {
	connectMobileCdp,
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

const port = Number(process.argv[2] || 9262);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const client = await connectMobileCdp(port, route);
const receipt = { ok: false, port, route };

try {
	await client.send('Runtime.enable');
	await client.send('Network.enable');
	await new Promise(resolve => setTimeout(resolve, 1000));
	receipt.state = await evaluateMobile(client, `(() => {
		const root = document.documentElement.dataset;
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		return {
			bodyChildren: document.body?.children?.length || 0,
			enemies: runtime?.enemies?.actors?.length || 0,
			featurePhase: runtime?.featureStatus?.phase || '',
			houses: runtime?.houses?.houses?.length || 0,
			htmlLength: document.documentElement?.outerHTML?.length || 0,
			readyState: document.readyState,
			readiness: root.awtsmoosReadiness || '',
			rendererStage: root.awtsmoosRendererStage || '',
			resources: performance.getEntriesByType('resource').length,
			runtimePresent: Boolean(runtime),
			runtimeState: root.awtsmoosRuntimeState || '',
			scripts: document.scripts.length,
			title: document.title,
			url: location.href
		};
	})()`);
	receipt.browserEvidence = client.evidence;
	receipt.ok = true;
} catch (error) {
	receipt.error = { message: error?.message || String(error), stack: error?.stack || '' };
	process.exitCode = 1;
} finally {
	client.close();
	console.log(JSON.stringify(receipt, null, 2));
}
