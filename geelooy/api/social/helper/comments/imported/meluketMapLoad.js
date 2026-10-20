//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module MeluketMapLoad
 * @description State owner for the meluket map cache; validation, load and resolve (split from meluketMap.js, verbatim).
 */

const fs = require('fs');
const path = require('path');

	const { importedDbFile, dbReadMap } = require("./meluketMapDb.js");

let cached = null;
let cachedFile = '';
let cachedMark = '';

function validate(parsed) {
	if (!parsed || parsed.version !== 1) return false;
	return parsed.count === Object.keys(parsed.entries || {}).length;
}

function mapFile($i) {
	return path.join($i.db.directory, 'socialPacked', 'meluket-post-map.v1.json');
}

function load($i) {
	// B"H — AwtsmoosDB first.
	const fromDb = dbReadMap();
	if (fromDb && validate(fromDb)) {
		const mark = `db:${importedDbFile()}`;
		if (!(cached && cachedFile === mark && cachedMark === mark)) {
			cached = fromDb.entries;
			cachedFile = mark;
			cachedMark = mark;
		}
		return cached;
	}
	// JSON fallback.
	const file = mapFile($i);
	const stat = fs.statSync(file);
	const mark = `${stat.size}:${Math.floor(stat.mtimeMs)}`;
	if (cached && cachedFile === file && cachedMark === mark) return cached;
	const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
	if (!validate(parsed)) {
		throw new Error('Invalid Meluket mapping file.');
	}
	cached = parsed.entries;
	cachedFile = file;
	cachedMark = mark;
	return cached;
}

function resolve($i, seriesId, postId) {
	try { return load($i)[`${seriesId}\0${postId}`] || null; }
	catch { return null; }
}

function entries($i) {
	try { return load($i); }
	catch { return {}; }
}

module.exports = {
	validate,
	mapFile,
	load,
	resolve,
	entries,
};
