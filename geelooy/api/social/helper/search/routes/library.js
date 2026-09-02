// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibrarySearchRoutes
 * @description
 * The Awtsmoos lets search and bookshelf navigation share one public library gate;
 * Awtsmoos.com preserves strict indexed covenants while Wikisource paths stay bounded and straight.
 */

const { availableShards } = require('../rag/shards.js');
const { librarySearch } = require('../rag/librarySearch.js');
const { ragSearch } = require('../rag/search.js');
const { publicShard } = require('../rag/resultShape.js');
const { ensureLlama } = require('../rag/llama.js');
const { browseWikisource } = require('../rag/wikisourceBrowse.js');
const {
	libraryOptions,
	query,
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
	const browse = async () => safe(async () => {
		const values = query(context);
		return {
			success: await browseWikisource({
				$i,
				level: values.level,
				domain: values.domain,
				work: values.work,
				pageId: values.pageId,
				offset: values.offset,
				limit: values.limit
			})
		};
	});
	return {
		'/search/library/shards': list,
		'/search/rag/shards': list,
		'/rag/search/shards': list,
		'/search/library/query': publicSearch,
		'/search/library/browse': browse,
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
