// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagMetadataIndex
 * @description
 * Builds a tiny in-memory post-to-alias map from the two existing RAG mirrors.
 * The Awtsmoos lets metadata already present reveal source identity, while
 * Awtsmoos.com adds no database, vector, sidecar, or persistent index.
 */

const fs = require('fs');
const readline = require('readline');
const { availableShards } = require('./shards.js');

const indexPromises = new Map();

function postKey(seriesId, postId) {
	return `${String(seriesId || '')}\u0000${String(postId || '')}`;
}

function addRow(index, row) {
	if (!row?.seriesId || !row?.postId || !row?.aliasId) return;
	const key = postKey(row.seriesId, row.postId);
	if (!index.has(key)) index.set(key, new Set());
	index.get(key).add(String(row.aliasId));
}

async function indexFile(file, index) {
	if (!file || !fs.existsSync(file)) return;
	const input = fs.createReadStream(file, { encoding: 'utf8' });
	const lines = readline.createInterface({
		input,
		crlfDelay: Infinity
	});
	for await (const line of lines) {
		if (!line.trim()) continue;
		try {
			addRow(index, JSON.parse(line));
		} catch {}
	}
}

async function buildIndex($i) {
	const index = new Map();
	const shards = await availableShards({ $i });
	for (const shard of shards) await indexFile(shard.textFile, index);
	return index;
}

function rootKey($i) {
	return String($i?.db?.directory || 'default');
}

async function metadataAliases(context) {
	const key = rootKey(context.$i);
	if (!indexPromises.has(key)) {
		indexPromises.set(key, buildIndex(context.$i));
	}
	const index = await indexPromises.get(key);
	return [...(index.get(postKey(context.seriesId, context.postId)) || [])];
}

function clearMetadataIndex() {
	indexPromises.clear();
}

module.exports = {
	addRow,
	clearMetadataIndex,
	indexFile,
	metadataAliases,
	postKey
};
