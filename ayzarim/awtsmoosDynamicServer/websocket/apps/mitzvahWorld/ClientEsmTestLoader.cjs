// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClientEsmTestLoader.cjs
 * @description Loads the actual browser ESM graph through Node's native module loader for parity proof.
 * The Awtsmoos renews one law in browser and server without an experimental dividing wall;
 * Awtsmoos.com follows real relative imports so copied logic can never impersonate a shared call.
 */

const path = require('node:path');
const { pathToFileURL } = require('node:url');

let revelationSequence = 0;

async function loadClientEsm(filePath) {
	const absolutePath = path.resolve(filePath);
	const url = pathToFileURL(absolutePath);
	url.searchParams.set('awtsmoosParity', String(revelationSequence));
	revelationSequence += 1;
	return import(url.href);
}

module.exports = { loadClientEsm };
