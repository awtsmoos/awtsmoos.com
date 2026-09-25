#!/usr/bin/env node
// B"H
/**
 * Boruch Hashem. Blessed is He.
 *
 * @file import-ayin-beis-authorized.js
 * @description
 * A CLI gate for revealing authorized Ayin Beis text in Awtsmoos.com. It has
 * no downloader and defaults to vision without mutation: dry-run first, then
 * an explicit apply only when the bundle itself records redistribution rights.
 */

const path = require('path');
const DosDB = require('../ayzarim/DosDB/index.js');
const { runAuthorizedImport } = require('../geelooy/api/social/helper/imports/ayinBeis/index.js');

function argument(name, fallback = '') {
	const prefix = `--${name}=`;
	const found = process.argv.find(value => value === `--${name}` || value.startsWith(prefix));
	if (!found) return fallback;
	return found === `--${name}` ? 'true' : found.slice(prefix.length);
}

function flag(name) {
	return process.argv.includes(`--${name}`) || argument(name) === 'true';
}

async function main() {
	const source = argument('source');
	const dbArgument = argument('db');
	if (!source || !dbArgument) {
		throw new Error('Usage: import-ayin-beis-authorized.js --source=/path/bundle.json --db=/path/dayuhChadash [--apply] [--replace-nonempty]');
	}
	const dbPath = path.resolve(dbArgument);
	const db = new DosDB(dbPath);
	await db.init();
	process.awtsmoosDbPath = dbPath;
	const backupDir = path.resolve(argument('backup-dir', `.awtsmoos-tmp/ayin-beis-import-backups/${Date.now()}`));
	try {
		const report = await runAuthorizedImport({
			db,
			bundlePath: path.resolve(source),
			apply: flag('apply'),
			replaceNonempty: flag('replace-nonempty'),
			heichelId: argument('heichel', 'ikar'),
			backupDir
		});
		console.log(JSON.stringify(report, null, 2));
	} finally {
		if (typeof db.close === 'function') await db.close();
	}
}

main().catch(error => {
	console.error(JSON.stringify({ B_H: true, error: error.message }, null, 2));
	process.exit(1);
});
