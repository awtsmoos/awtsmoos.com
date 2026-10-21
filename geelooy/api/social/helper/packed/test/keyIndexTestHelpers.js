//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file keyIndexTestHelpers.js
 * @description Temp-vessel helpers extracted verbatim from keyIndex.test.js.
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function tempRoot() {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-keyidx-'));
	return dir;
}

function rimraf(dir) {
	fs.rmSync(dir, { recursive: true, force: true });
}

function vessel(dir) {
	return { db: { directory: dir } };
}

function shardFile(dir) {
	return path.join(dir, 'socialPacked', 'social.core.awtsdb');
}

module.exports = { tempRoot, rimraf, vessel, shardFile };