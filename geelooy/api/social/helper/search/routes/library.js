// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibrarySearchRoutes
 * @description
 * Public library questions may cross every completed lane, while strict RAG
 * spellings preserve their single-lane persisted-index covenant. Frozen request
 * values prevent concurrent callers from crossing strategies or corpora.
 */

const { availableShards } = require('../rag/shards.js');
const { librarySearch } = require('../rag/librarySearch.js');
const { ragSearch } = require('../rag/search.js');
const { publicShard } = require('../rag/resultShape.js');
const { ensureLlama } = require('../rag/llama.js');
const {
	libraryOptions,
	strictRagOptions
} = require('./values.js');
const { requestInterface } = require('./requestSnapshot.js');
const { safe } = require('./safe.js');

function libraryRoutes(context) {
	const $i = requestInterface(context);
	const list = async () => safe(async () => ({
		success: (await availableShards({ $i })).map(publicShard)
	}));
	const publicSearch = async () => safe(async () => ({
		success: await librarySearch(libraryOptions(context))
	}));
	const strictSearch = async () => safe(async () => ({
		success: await ragSearch(strictRagOptions(context))
	}));
	return {
		'/search/library/shards': list,
		'/search/rag/shards': list,
		'/rag/search/shards': list,
		'/search/library/query': publicSearch,
		'/search/rag/query': strictSearch,
		'/rag/search/query': strictSearch,
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
