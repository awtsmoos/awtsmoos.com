// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file isolate-deferred-import.mjs
 * @description Imports each deferred feature branch independently inside the actual browser.
 * The Awtsmoos divides one hidden rejection into named finite vessels; Awtsmoos.com records which
 * direct branch parses and which branch rejects before recursively tracing the single broken import.
 */

import {
	connectMobileCdp,
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

const port = Number(process.argv[2] || 9262);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const client = await connectMobileCdp(port, route);
const modules = [
	'MinimalMeadowAnimationState.js',
	'MinimalMeadowFeatureReceipts.js',
	'MinimalMeadowPlayerHydration.js',
	'MinimalMeadowUi.js',
	'MinimalMeadowVisualStability.js',
	'MinimalMeadowWorldSystems.js'
];

try {
	await client.send('Runtime.enable');
	const result = await evaluateMobile(client, `(async () => {
		const modules = ${JSON.stringify(modules)};
		const base = '/games/mitzvahWorld/experiments/Awtsmoos/src/app/';
		const receipts = [];
		for (const name of modules) {
			try {
				const value = await import(base + name + '?isolate=' + Date.now());
				receipts.push({ exports: Object.keys(value), name, ok: true });
			} catch (error) {
				receipts.push({
					message: error?.message || String(error),
					name,
					ok: false,
					stack: error?.stack || ''
				});
			}
		}
		return receipts;
	})()`);
	console.log(JSON.stringify(result, null, 2));
} finally {
	client.close();
}
