//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file descriptor.mjs
 * @description
 * The Awtsmoos distills one reviewed legacy publication witness into the tiny
 * native descriptor serving actually needs. Awtsmoos.com records explicit
 * language and semantic eligibility so stored vectors never imply product truth.
 */

import path from 'node:path';

/** Converts one approved physical shard into native publication-catalog truth. */
export function descriptorFor(shard, roots) {
	const rootKind = rootKindFor(shard.file, roots);
	const contentLanguage = languageFor(shard);
	return {
		id: String(shard.id || ''),
		title: String(shard.title || shard.id || ''),
		aliases: Array.isArray(shard.aliases) ? [...shard.aliases] : [],
		rootKind,
		databaseName: path.basename(shard.file),
		textName: siblingName(shard.textFile, shard.file),
		matrixName: siblingName(shard.matrixFile, shard.file),
		listName: shard.listName || null,
		count: Number(shard.count || 0),
		dimensions: Number(shard.dimensions || 0),
		embeddingModel: shard.embeddingModel || null,
		indexType: shard.indexType || 'hnsw',
		partNumber: Number(shard.partNumber || 0),
		expectedParts: Number(shard.expectedParts || 1),
		partial: shard.partial === true,
		textOnly: shard.textOnly === true,
		vectorEnabled: shard.vectorEnabled === true,
		contentLanguage,
		semanticEligible: contentLanguage === 'en'
			&& shard.vectorEnabled === true
			&& shard.textOnly !== true
	};
}

/** Resolves only one of the three reviewed publication roots. */
function rootKindFor(file, roots) {
	const directory = path.dirname(path.resolve(file));
	for (const [kind, root] of Object.entries(roots)) {
		if (root && directory === path.resolve(root)) return kind;
	}
	throw new Error(`B"H publication root is not approved: ${file}`);
}

/** Keeps sidecars sibling-local so runtime never accepts arbitrary absolute paths. */
function siblingName(candidate, database) {
	if (!candidate) return null;
	if (path.dirname(path.resolve(candidate)) !== path.dirname(path.resolve(database))) return null;
	return path.basename(candidate);
}

/** Declares source language explicitly at publication time, never from query text. */
function languageFor(shard = {}) {
	if (shard.contentLanguage) return String(shard.contentLanguage).toLowerCase();
	const id = String(shard.id || '').toLowerCase();
	if (id.includes('tanach') || id.includes('wikisource')) return 'he';
	return 'en';
}
