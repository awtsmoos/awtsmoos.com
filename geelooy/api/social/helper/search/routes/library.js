// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibrarySearchRoutes
 * @chapter Every Search Handler Carries Its Own Frozen Request Values
 * @description
 * Generic library search and both strict RAG spellings use the request snapshot
 * captured before authentication. Caller parameters cannot cross lanes or weaken
 * the persisted-index contract after concurrent requests begin.
 */

const { availableShards } = require('../rag/shards.js');
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
	const librarySearch = async () => safe(async () => ({
		success: await ragSearch(libraryOptions(context))
	}));
	const strictRagSearch = async () => safe(async () => ({
		success: await ragSearch(strictRagOptions(context))
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
