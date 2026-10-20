//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module MigrateBundlesMain
 * @description Migration entry point (split from migrateBundlesToAwtsmoosDb.js, verbatim); runs on load, exactly like the original script.
 */

const fs = require('fs');
const path = require('path');

const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

const { resolveSocialShardRoot } = require('../../awtsmoosDb/shardRoot.js');

	const { BUNDLES, DB_OPTIONS, parseArgs, loadProgress } = require("./migrateBundlesCore.js");

	const { migrateBundle } = require("./migrateBundlesBundle.js");

	const { migrateMap } = require("./migrateBundlesMap.js");

async function main() {
	const args = parseArgs(process.argv);
	const dataRoot = args.dataRoot || path.join(__dirname, 'data');
	const defaultDb = path.join(path.dirname(resolveSocialShardRoot()), 'imported-comments.awtsmoosdb');
	const dbFile = args.dbFile || defaultDb;

	// B"H — --map alone migrates only the map (no bundles unless --bundle given).
	const bundles = args.bundle ? [args.bundle] : (args.mapFile ? [] : BUNDLES);
	for (const b of bundles) {
		if (!BUNDLES.includes(b)) {
			console.error(`B"H unknown bundle: ${b} (expected ${BUNDLES.join('|')})`);
			process.exit(1);
		}
	}

	console.log(`B"H migrating bundles [${bundles.join(', ')}]`);
	console.log(`B"H data root: ${dataRoot}`);
	console.log(`B"H db file:   ${dbFile}`);
	fs.mkdirSync(path.dirname(dbFile), { recursive: true });

	const db = new AwtsmoosDB(dbFile, DB_OPTIONS);
	db.open();
	const progress = loadProgress(dbFile);
	let failed = false;
	try {
		for (const bundle of bundles) {
			const { errors } = await migrateBundle(db, dbFile, bundle, dataRoot, progress, args.verify);
			if (errors.length) failed = true;
		}
		if (args.mapFile) {
			const { errors } = await migrateMap(db, args.mapFile, args.verify);
			if (errors.length) failed = true;
		}
	} finally {
		try { db.close(); } catch {}
	}

	const dbSize = fs.existsSync(dbFile) ? fs.statSync(dbFile).size : 0;
	console.log(`B"H db file size: ${(dbSize / 1048576).toFixed(1)} MB`);
	if (failed) {
		console.log('B"H migration finished WITH ERRORS (see above)');
		process.exit(1);
	}
	console.log('B"H migration finished cleanly');
}

main().catch(err => {
	console.error('B"H migration FAILED:', err && err.message ? err.message : err);
	process.exit(1);
});
