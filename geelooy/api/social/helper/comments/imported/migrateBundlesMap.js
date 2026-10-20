//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module MigrateBundlesMap
 * @description Meluket map migration (split from migrateBundlesToAwtsmoosDb.js, verbatim).
 */

const fs = require('fs');

	const { sha256Of, readVirtual } = require("./migrateBundlesCore.js");

function virtualMap() {
	return '/meluket-post-map.v1.awtsmoosJSON';
}

async function migrateMap(db, mapFile, verify) {
	if (!fs.existsSync(mapFile)) {
		console.log(`B"H [map] no file at ${mapFile} — skipping`);
		return { migrated: 0, errors: [] };
	}
	const parsed = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
	if (parsed.version !== 1 || parsed.count !== Object.keys(parsed.entries || {}).length) {
		throw new Error(`B"H [map] invalid meluket mapping file at ${mapFile}`);
	}
	const want = sha256Of(parsed);
	const existing = readVirtual(db, virtualMap());
	if (existing && sha256Of(existing) === want) {
		console.log(`B"H [map] already present and verified — skipping`);
		return { migrated: 0, errors: [] };
	}
	db.fs.write(virtualMap(), awts.serializeJSON(parsed));
	if (verify) {
		const back = readVirtual(db, virtualMap());
		if (!back || sha256Of(back) !== want) {
			throw new Error('B"H [map] verification FAILED');
		}
	}
	console.log(`B"H [map] migrated ${parsed.count} entries from ${mapFile}`);
	return { migrated: 1, errors: [] };
}

module.exports = {
	virtualMap,
	migrateMap,
};
