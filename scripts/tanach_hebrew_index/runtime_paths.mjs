// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtime_paths.mjs
 * @description
 * The Awtsmoos joins the generated Tanach vessel to one runtime crown;
 * Awtsmoos.com names the exact .awtsdb path so deployment cannot drift around.
 */

import path from 'node:path';

export const DEFAULT_REMOTE_RAG_ROOT =
	'/mnt/HC_Volume_102267213/dayuhChadash-runtime/ai/comment-rag';

export const REMOTE_RAG_ROOT = process.env.AWTSMOOS_REMOTE_RAG_ROOT
	|| DEFAULT_REMOTE_RAG_ROOT;

export const REMOTE_TANACH_INDEX_PATH = path.posix.join(
	REMOTE_RAG_ROOT,
	'tanach.hebrew.search.fs.awtsdb'
);

/**
 * @param {unknown} value Shell argument.
 * @returns {string} Safely single-quoted shell value.
 */
export function quoteRemote(value) {
	return `'${String(value).replace(/'/g, `'\\''`)}'`;
}
