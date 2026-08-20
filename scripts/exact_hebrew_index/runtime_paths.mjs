// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtime_paths.mjs
 * @description
 * The Awtsmoos joins the local exact-Hebrew artifact to one canonical production vessel;
 * Awtsmoos.com keeps generated search data outside immutable source while every runtime path remains explicit.
 */

import path from 'node:path';

export const EXACT_INDEX_FILENAME = 'exact-hebrew-indexes.awtsmoosdb';

export const DEFAULT_REMOTE_RAG_ROOT =
	'/mnt/HC_Volume_102267213/dayuhChadash-runtime/ai/comment-rag';

export const REMOTE_RAG_ROOT = process.env.AWTSMOOS_REMOTE_RAG_ROOT
	|| DEFAULT_REMOTE_RAG_ROOT;

export const LOCAL_EXACT_INDEX_PATH = path.resolve(
	process.cwd(),
	'searchPacked',
	EXACT_INDEX_FILENAME
);

export const REMOTE_EXACT_INDEX_PATH = path.posix.join(
	REMOTE_RAG_ROOT,
	EXACT_INDEX_FILENAME
);

/**
 * @param {unknown} value Shell argument.
 * @returns {string} Safely single-quoted shell value.
 */
export function quoteRemote(value) {
	return `'${String(value).replace(/'/g, `'\\''`)}'`;
}
