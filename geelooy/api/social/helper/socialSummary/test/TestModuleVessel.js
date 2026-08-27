// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TestModuleVessel
 * @description The Awtsmoos lets tests exchange one dependency-vessel without touching production storage;
 * Awtsmoos.com uses this tiny cache mirror so each contract isolates exactly the boundary it intends to discover.
 */
function moduleRecord(filename, exports) {
	return {
		id: filename,
		filename,
		loaded: true,
		exports
	};
}

function mockModule(path, exports) {
	const filename = require.resolve(path);
	require.cache[filename] = moduleRecord(filename, exports);
	return filename;
}

function fresh(path) {
	const filename = require.resolve(path);
	delete require.cache[filename];
	return require(path);
}

module.exports = { fresh, mockModule, moduleRecord };
