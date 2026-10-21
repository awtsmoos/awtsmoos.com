//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ProfileCommentBrowseSearch
 * @description
 * Sibling of ProfileCommentBrowse: comment search, relocated verbatim.
 */

const { paths, read, CHUNK } = require('./commentBrowseCache.js');
const { scanAliasStructure } = require('./commentBrowseScan.js');
const { flattenFileComments } = require('./commentBrowseFiles.js');

async function searchCommentsByAlias({ $i, aliasId, q, limit = 50 }) {
	const needle = String(q || "").trim().toLowerCase();
	const safeLimit = Math.max(1, Math.min(200, Number(limit) || 50));
	if (needle.length < 2) return { query: String(q || ""), total: 0, scannedPosts: 0, complete: true, items: [] };
	const structure = await scanAliasStructure($i, aliasId);
	const matches = [];
	let scannedPosts = 0;
	let complete = true;
	for (const series of structure) {
		const postIds = series.posts.map(p => p.postId);
		for (let i = 0; i < postIds.length; i += CHUNK) {
			const batch = await Promise.all(postIds.slice(i, i + CHUNK).map(async postId => {
				const file = await read($i, paths.commentAliasPost(series.heichelId, series.seriesId, postId, aliasId), {});
				return { postId, file };
			}));
			for (const { postId, file } of batch) {
				scannedPosts += 1;
				const post = series.posts.find(p => p.postId === postId);
				for (const comment of flattenFileComments({
					file,
					aliasId,
					heichelId: series.heichelId,
					heichelName: series.heichelName,
					seriesId: series.seriesId,
					seriesTitle: series.title,
					postId,
					postTitle: (post && post.postTitle) || postId
				})) {
					if (`${comment.content} ${comment.postTitle}`.toLowerCase().includes(needle)) {
						matches.push(comment);
						if (matches.length >= safeLimit) {
							complete = false;
							return { query: String(q), total: matches.length, scannedPosts, complete, items: matches };
						}
					}
				}
			}
		}
	}
	return { query: String(q), total: matches.length, scannedPosts, complete, items: matches };
}

module.exports = { searchCommentsByAlias };
