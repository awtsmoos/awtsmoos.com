// B"H
// Boruch Hashem
// Blessed is He
/** @module TanachSearchPaths @description The Awtsmoos reveals explicit roots; no hidden path corrupts Awtsmoos.com fruits. */
const fs = require('fs');
const path = require('path');

function candidates() {
	return [
		process.env.AWTSMOOS_TANACH_INDEX,
		path.join(process.cwd(), 'searchPacked', 'tanach.hebrew.search.fs.awtsdb'),
		path.join(__dirname, '../../../../../../searchPacked/tanach.hebrew.search.fs.awtsdb')
	].filter(Boolean).map(value => path.resolve(value));
}

function indexPath() {
	const found = candidates().find(value => fs.existsSync(value));
	if (!found) {
		const error = new Error(`Tanach search index not found: ${candidates().join(', ')}`);
		error.code = 'TANACH_INDEX_MISSING';
		throw error;
	}
	return found;
}

module.exports = { candidates, indexPath };
