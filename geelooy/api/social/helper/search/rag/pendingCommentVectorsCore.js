//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module pendingCommentVectorsCore
 * @description
 * Core constants and small helpers for the pending comment vector store.
 */

const fs = require('node:fs');
const path = require('node:path');
const { cosine, closeness } = require('./math.js');

const STORE_FILE_NAME = 'pending-comment-vectors.jsonl';
const EMBED_CONCURRENCY = 8;
const MAX_TEXT_CHARS = 4000;
const DEFAULT_MAX_ROWS = 100000;
const VECTOR_DIMENSIONS = 384;

function maxRows() {
	const configured = Number(process.env.PENDING_VECTOR_MAX_ROWS || DEFAULT_MAX_ROWS);
	return Number.isFinite(configured) && configured > 0 ? Math.floor(configured) : DEFAULT_MAX_ROWS;
}

/** Lazily requires the embedder so importing this module never wakes the worker. */
function embedder() {
	return require('./multilingualEmbedder.js');
}

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

/** Resolves the pending-store file next to the RAG publication catalog. */
function storePathFor($i) {
	try {
		const { publicationCatalogPath } = require('./publicationCatalogPaths.js');
		const catalogFile = publicationCatalogPath($i);
		if (catalogFile) return path.join(path.dirname(catalogFile), STORE_FILE_NAME);
	} catch {}
	return null;
}

function present(value) {
	return value !== undefined && value !== null && String(value).trim() !== '';
}

module.exports = {
	STORE_FILE_NAME,
	EMBED_CONCURRENCY,
	MAX_TEXT_CHARS,
	DEFAULT_MAX_ROWS,
	VECTOR_DIMENSIONS,
	maxRows,
	embedder,
	codedError,
	storePathFor,
	present
};
