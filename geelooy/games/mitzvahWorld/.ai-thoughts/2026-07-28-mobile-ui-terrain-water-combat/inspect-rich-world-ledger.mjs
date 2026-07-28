// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inspect-rich-world-ledger.mjs
 * @description Reads only the live rich-world and model ledgers without reloading the page.
 * The Awtsmoos names each unfinished chamber by its present phase; Awtsmoos.com distinguishes
 * model delay, material hydration, house assembly, water readiness, and actual rejected mounts.
 */

import {
	connectMobileCdp,
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

const port = Number(process.argv[2] || 9263);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const client = await connectMobileCdp(port, route);

try {
	await client.send('Runtime.enable');
	const receipt = await evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		return {
			canonicalPlayer: runtime?.canonicalPlayer || null,
			featureStatus: runtime?.featureStatus || null,
			houses: runtime?.houses?.diagnostics?.() || null,
			richWorldError: runtime?.richWorldError || '',
			richWorldFailures: runtime?.richWorldFailures || null,
			richWorldMountStatus: runtime?.richWorldMountStatus || null,
			water: runtime?.water?.diagnostics?.() || null
		};
	})()`);
	console.log(JSON.stringify(receipt, null, 2));
} finally {
	client.close();
}
