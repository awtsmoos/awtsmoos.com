// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibrarySearchRoutes
 * @description
 * Generic library search may choose its strategy. Both public RAG route spellings
 * are separate strict gates that force local embedding plus persisted HNSW and
 * refuse installation, exact scan, linear scan, or text fallback.
 */

const { availableShards } = require('../rag/shards.js');
const { ragSearch } = require('../rag/search.js');
const { publicShard } = require('../rag/resultShape.js');
const { ensureLlama } = require('../rag/llama.js');
const {
	libraryOptions,
	strictRagOptions
} = require('./values.js');
const { safe } = require('./safe.js');

function libraryRoutes($i) {
	const list = async () => safe(async () => ({
		success: (await availableShards({ $i })).map(publicShard)
	}));
	const librarySearch = async () => safe(async () => ({
		success: await ragSearch(libraryOptions($i))
	}));
	const strictRagSearch = async () => safe(async () => ({
		success: await ragSearch(strictRagOptions($i))
	}));
	return {
		'/search/library/shards': list,
		'/search/rag/shards': list,
		'/rag/search/shards': list,
		'/search/library/query': librarySearch,
		'/search/rag/query': strictRagSearch,
		'/rag/search/query': strictRagSearch,
		'/search/rag/llama/status': async () => safe(async () => ({
			success: await ensureLlama({
				$i,
				autoInstall: false
			})
		}))
	};
}

module.exports = {
	libraryRoutes
};
