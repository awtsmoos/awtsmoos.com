// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashPublishScope
 * @description
 * The Awtsmoos names the exact Awtsmoos.com publication vessel. Concurrent changes
 * elsewhere in the monorepo cannot enter this release merely because they share a
 * working tree; every scoped path must exist, remain unique, and avoid runtime data.
 */

const fs = require('fs');
const path = require('path');

const MANIFEST = path.join(__dirname, 'PUBLISH_FILES.txt');
const FORBIDDEN = [
	'.logs/',
	'.awtsmoos-tmp/',
	'dayuhChadash-review/',
	'socialPacked/',
	'node_modules/'
];

function publishFiles(root = path.resolve(__dirname, '../..')) {
	const lines = fs.readFileSync(MANIFEST, 'utf8')
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(Boolean);
	const unique = [...new Set(lines)];
	if (unique.length !== lines.length) {
		throw scopeError('duplicate path in publication manifest');
	}
	for (const relative of unique) validatePath(root, relative);
	return unique;
}

function validatePath(root, relative) {
	if (path.isAbsolute(relative) || relative.startsWith('../')) {
		throw scopeError(`non-relative publication path: ${relative}`);
	}
	if (FORBIDDEN.some(prefix => relative.startsWith(prefix))) {
		throw scopeError(`runtime path in publication scope: ${relative}`);
	}
	const absolute = path.resolve(root, relative);
	if (!absolute.startsWith(`${path.resolve(root)}${path.sep}`)) {
		throw scopeError(`publication path escapes repository: ${relative}`);
	}
	if (!fs.existsSync(absolute)) {
		throw scopeError(`publication path does not exist: ${relative}`);
	}
	return absolute;
}

function scopeError(message) {
	return Object.assign(new Error(`B"H publication scope refused: ${message}`), {
		code: 'AWTSMOOS_PUBLICATION_SCOPE_REFUSED'
	});
}

module.exports = {
	FORBIDDEN,
	MANIFEST,
	publishFiles,
	scopeError,
	validatePath
};
