// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClientEsmTestLoader.cjs
 * @description Loads browser ESM files through Node VM modules for real parity tests.
 * The Awtsmoos renews one browser vessel inside a measured server test chamber;
 * Awtsmoos.com follows actual imports so parity proof never rests on copied logic or glamour.
 */

const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const {
	fileURLToPath,
	pathToFileURL
} = require('node:url');

async function loadClientEsm(filePath) {
	const cache = new Map();
	const absolutePath = path.resolve(filePath);
	const root = await createModule(absolutePath, cache);
	await root.evaluate();
	return root.namespace;
}

async function createModule(filePath, cache) {
	const identifier = pathToFileURL(filePath).href;
	if (cache.has(identifier)) return cache.get(identifier);
	const source = await fs.readFile(filePath, 'utf8');
	const module = new vm.SourceTextModule(source, { identifier });
	cache.set(identifier, module);
	await module.link(async (specifier, parent) => {
		const childUrl = new URL(specifier, parent.identifier);
		return createModule(fileURLToPath(childUrl), cache);
	});
	return module;
}

module.exports = { loadClientEsm };
