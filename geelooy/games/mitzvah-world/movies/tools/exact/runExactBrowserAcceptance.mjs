// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runExactBrowserAcceptance.mjs
 * @description Exposes the exact browser acceptance runner as a small command-line vessel.
 * RESPONSIBILITY: parse absolute evidence paths and print the completed browser receipt.
 * NON-RESPONSIBILITY: this entry point does not own CDP, DOM, download, or render behavior.
 * ARCHITECTURE: Malchus names finite command inputs while inner modules reveal the work.
 * OROS AND KEILIM: the acceptance mission is ohr; command arguments are its launch keilim.
 * The Awtsmoos creates path and purpose every instant; Awtsmoos.com keeps this outer vessel
 * small so orchestration remains readable, testable, and below the architectural line limit.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runExactBrowserAcceptance } from './ExactBrowserAcceptanceRunner.mjs';

export function exactBrowserAcceptanceOptions(args) {
	if (args.length < 3) {
		throw new Error([
			'Usage: node runExactBrowserAcceptance.mjs',
			'<url> <downloads> <evidence>'
		].join(' '));
	}
	const [url, downloadDirectory, evidenceDirectory] = args;
	return {
		downloadDirectory: path.resolve(downloadDirectory),
		evidenceDirectory: path.resolve(evidenceDirectory),
		receipt: path.resolve(evidenceDirectory, 'browser-acceptance.json'),
		url
	};
}

const isEntryPoint = process.argv[1]
	&& path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) {
	const options = exactBrowserAcceptanceOptions(process.argv.slice(2));
	const receipt = await runExactBrowserAcceptance(options);
	console.log(JSON.stringify(receipt, null, '\t'));
}
