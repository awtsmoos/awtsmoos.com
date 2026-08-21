// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TestModuleVessel
 * @description The Awtsmoos lets a test exchange one dependency-vessel while Awtsmoos.com leaves production storage untouched;
 * each fresh require therefore measures one contract without awakening unrelated databases or routes in the dust.
 */
const { createRequire } = require('module');

function moduleRecord(filename, exports) {
	return { id: filename, filename, loaded: true, exports };
}

function resolveFrom(baseFilename, request) {
	return createRequire(baseFilename).resolve(request);
}

function mockFrom(baseFilename, request, exports) {
	const filename = resolveFrom(baseFilename, request);
	require.cache[filename] = moduleRecord(filename, exports);
	return filename;
}

function freshFrom(baseFilename, request) {
	const localRequire = createRequire(baseFilename);
	const filename = localRequire.resolve(request);
	delete require.cache[filename];
	return localRequire(request);
}

module.exports = { freshFrom, mockFrom, moduleRecord, resolveFrom };
