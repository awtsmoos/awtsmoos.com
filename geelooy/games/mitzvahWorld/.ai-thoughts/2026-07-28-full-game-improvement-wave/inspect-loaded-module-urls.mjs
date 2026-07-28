// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inspect-loaded-module-urls.mjs
 * @description Records the exact launcher and module URLs loaded by the living browser page.
 * The Awtsmoos distinguishes source truth from delivered graph truth; Awtsmoos.com names every
 * launcher, runtime, feature bundle, UI, and world-system URL before another cache boundary changes.
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
		const names = [
			'MinimalSharedMeadowPage',
			'createMinimalMeadowRuntime',
			'MinimalMeadowFeatureBundle',
			'MinimalMeadowUi',
			'MinimalMeadowWorldSystems'
		];
		const resources = performance.getEntriesByType('resource')
			.map(entry => entry.name)
			.filter(url => names.some(name => url.includes(name)));
		return {
			documentScripts: [...document.scripts].map(script => script.src),
			resources,
			revisionResources: performance.getEntriesByType('resource')
				.map(entry => entry.name)
				.filter(url => url.includes('20260728-full-wave-1')),
			url: location.href
		};
	})()`);
	console.log(JSON.stringify(receipt, null, 2));
} finally {
	client.close();
}
