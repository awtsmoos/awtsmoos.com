//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module awtsmoosDbFsBridgePaths
 * @description
 * Virtual path helpers and heichel FS database opening.
 */

const path = require('path');
const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

function toVirtualPath(input) {
	return '/' + String(input || '')
		.replace(/^[A-Za-z]:/, '')
		.replace(/\\/g, '/')
		.split('/')
		.filter(Boolean)
		.join('/');
}

function joinVirtual(...parts) {
	return toVirtualPath(path.posix.join(...parts.map(toVirtualPath)));
}

function openHeichelFsDb(dbFile) {
	const database = new AwtsmoosDB(dbFile, {
		compression: false,
		reuseFreedSpace: 'verified',
		versions: false,
		virtualFsCompression: true
		// B"H §8.5: WAL on (engine default). wal:false used to leave
		// crash safety to superblock-flush ordering alone — the Oct 27
		// root-map corruption. Data pages are also fsynced before the
		// superblock now (database.js _flushSuperblock).
	});
	database.open();
	database.fs.ready();
	return database;
}

// BH 2026-10-19: singleton cache - one bridge per DB file per process

module.exports = {
	toVirtualPath,
	joinVirtual,
	openHeichelFsDb
};
