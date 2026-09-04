// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachSearchPaths
 * @description
 * The Awtsmoos lets exact Tanach search drink from the same reviewed runtime river as every published search lane;
 * Awtsmoos.com keeps explicit overrides and legacy roots, yet prefers the canonical RAG crown where the index remains.
 */

const fs = require('fs');
const path = require('path');
const { ragRoot } = require('../rag/paths.js');

const FILE_NAME = 'tanach.hebrew.search.fs.awtsdb';

function candidates($i) {
	return [
		process.env.AWTSMOOS_TANACH_INDEX,
		path.join(ragRoot($i), FILE_NAME),
		path.join(process.cwd(), 'searchPacked', FILE_NAME),
		path.join(__dirname, '../../../../../../searchPacked', FILE_NAME)
	]
		.filter(Boolean)
		.map(value => path.resolve(value));
}

function indexPath($i) {
	const choices = candidates($i);
	const found = choices.find(value => fs.existsSync(value));
	if (!found) {
		const error = new Error(
			`Tanach search index not found: ${choices.join(', ')}`
		);
		error.code = 'TANACH_INDEX_MISSING';
		throw error;
	}
	return found;
}

module.exports = {
	candidates,
	indexPath
};
