//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module MigrateBundlesCore
 * @description Migration constants, argument parsing and virtual-path/progress helpers (split from migrateBundlesToAwtsmoosDb.js, verbatim).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { resolveSocialShardRoot } = require('../../awtsmoosDb/shardRoot.js');

const BUNDLES = ['meluket', 'sichosKodesh'];
const DB_OPTIONS = {
	compression: true,
	reuseFreedSpace: 'verified',
	versions: false,
	virtualFsCompression: true,
	wal: false
};

function parseArgs(argv) {
	const args = { bundle: null, dataRoot: null, dbFile: null, verify: true, mapFile: null };
	for (let i = 2; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--bundle') args.bundle = argv[++i];
		else if (a === '--data-root') args.dataRoot = path.resolve(argv[++i]);
		else if (a === '--db-file') args.dbFile = path.resolve(argv[++i]);
		else if (a === '--no-verify') args.verify = false;
		else if (a === '--map') args.mapFile = path.resolve(argv[++i]);
		else if (a === '--help' || a === '-h') {
			console.log('Usage: node migrateBundlesToAwtsmoosDb.js [--bundle meluket|sichosKodesh] [--data-root <dir>] [--db-file <path>] [--no-verify] [--map <path-to-meluket-post-map.v1.json>]');
			process.exit(0);
		}
	}
	return args;
}

function sha256Of(value) {
	return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function virtualManifest(bundle) {
	return `/${bundle}/manifest.awtsmoosJSON`;
}

function virtualPost(bundle, seriesId, postId) {
	return `/${bundle}/posts/${seriesId}/${postId}.awtsmoosJSON`;
}

function readVirtual(db, vpath) {
	const stat = db.fs.stat(vpath);
	if (!stat || !stat.exists || stat.type !== 'file' || !stat.size) return null;
	return awts.deserializeBinary(db.fs.readRange(vpath, 0, stat.size));
}

function progressPath(dbFile) {
	return `${dbFile}.migrate-progress.json`;
}

function loadProgress(dbFile) {
	try {
		return JSON.parse(fs.readFileSync(progressPath(dbFile), 'utf8'));
	} catch {
		return {};
	}
}

function saveProgress(dbFile, progress) {
	fs.writeFileSync(progressPath(dbFile), JSON.stringify(progress));
}

module.exports = {
	BUNDLES,
	DB_OPTIONS,
	parseArgs,
	sha256Of,
	virtualManifest,
	virtualPost,
	readVirtual,
	progressPath,
	loadProgress,
	saveProgress,
};
