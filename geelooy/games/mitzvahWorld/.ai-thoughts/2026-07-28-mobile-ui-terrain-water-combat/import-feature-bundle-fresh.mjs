// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file import-feature-bundle-fresh.mjs
 * @description Imports the complete deferred feature bundle under a fresh browser module identity.
 * The Awtsmoos joins six individually proven branches into one renewed doorway; Awtsmoos.com checks
 * the final composition before reloading the isolated world and accepting any runtime testimony.
 */

import {
	connectMobileCdp,
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

const port = Number(process.argv[2] || 9262);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const client = await connectMobileCdp(port, route);

try {
	await client.send('Runtime.enable');
	const receipt = await evaluateMobile(client, `(async () => {
		try {
			const module = await import(
				'/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowFeatureBundle.js?fresh=' + Date.now()
			);
			return { exports: Object.keys(module), ok: true };
		} catch (error) {
			return {
				message: error?.message || String(error),
				ok: false,
				stack: error?.stack || ''
			};
		}
	})()`);
	console.log(JSON.stringify(receipt, null, 2));
	process.exitCode = receipt.ok ? 0 : 1;
} finally {
	client.close();
}
