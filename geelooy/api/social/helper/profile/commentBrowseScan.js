//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ProfileCommentBrowseScan
 * @description
 * Sibling of ProfileCommentBrowse: alias structure scan, relocated verbatim.
 */

const { paths, read, cleanText, idList, CHUNK, cacheGet, cacheSet, chunked } = require('./commentBrowseCache.js');
const { countFileComments, firstPostTitle, latestStamp } = require('./commentBrowseFiles.js');

/**
 * Scans the alias comment harvest once and returns the browsable structure.
 * Cached briefly per alias so series -> posts -> comments drill-down stays fast.
 */
async function scanAliasStructure($i, aliasId) {
	const cached = cacheGet(aliasId);
	if (cached) return cached;

	const postKeys = new Map(); // `${heichelId}	${seriesId}	${postId}` -> { heichelId, seriesId, postId }
	const addKey = (heichelId, seriesId, postId) => {
		const key = `${heichelId}	${seriesId}	${postId}`;
		if (!postKeys.has(key)) postKeys.set(key, { heichelId, seriesId, postId });
	};

	// Source 1: alias-side comment index (fast canonical path).
	const aliasRoot = paths.aliasComments(aliasId);
	for (const heichelId of idList(await read($i, aliasRoot, {}))) {
		for (const seriesId of idList(await read($i, `${aliasRoot}/${heichelId}/series`, {}))) {
			for (const postId of idList(await read($i, `${aliasRoot}/${heichelId}/series/${seriesId}/atPost`, {}))) {
				addKey(heichelId, seriesId, postId);
			}
		}
	}

	// Source 2: heichelos comment tree (ground truth; covers imports that bypass the alias index).
	const heichelRoot = paths.heichelRoot();
	for (const heichelId of idList(await read($i, heichelRoot, {}))) {
		const atSeriesRoot = `${heichelRoot}/${heichelId}/comments/atSeries`;
		for (const seriesId of idList(await read($i, atSeriesRoot, {}))) {
			for (const postId of idList(await read($i, `${atSeriesRoot}/${seriesId}/atPost`, {}))) {
				const file = await read($i, paths.commentAliasPost(heichelId, seriesId, postId, aliasId), null);
				if (file) addKey(heichelId, seriesId, postId);
			}
		}
	}

	const keys = [...postKeys.values()];
	const heichelNames = {};
	await chunked([...new Set(keys.map(k => k.heichelId))], CHUNK, async heichelId => {
		const info = await read($i, paths.heichelInfo(heichelId), {});
		heichelNames[heichelId] = cleanText((info && (info.name || info.title)) || heichelId, 100);
	});

	const seriesTitles = {};
	const seriesList = [...new Set(keys.map(k => `${k.heichelId}	${k.seriesId}`))];
	await chunked(seriesList, CHUNK, async pair => {
		const [heichelId, seriesId] = pair.split("	");
		const info = await read($i, paths.seriesInfo(heichelId, seriesId), {});
		seriesTitles[pair] = cleanText((info && (info.name || info.title)) || seriesId, 120);
	});

	// Read every post file once (chunked) to count comments and capture titles.
	const fileByKey = new Map();
	await chunked(keys, CHUNK, async ({ heichelId, seriesId, postId }) => {
		const file = await read($i, paths.commentAliasPost(heichelId, seriesId, postId, aliasId), {});
		fileByKey.set(`${heichelId}	${seriesId}	${postId}`, file || {});
		return null;
	});

	const seriesMap = new Map(); // pair -> { heichelId, seriesId, title, posts: [] }
	for (const { heichelId, seriesId, postId } of keys) {
		const pair = `${heichelId}	${seriesId}`;
		if (!seriesMap.has(pair)) {
			seriesMap.set(pair, {
				heichelId,
				heichelName: heichelNames[heichelId] || heichelId,
				seriesId,
				title: seriesTitles[pair] || seriesId,
				posts: []
			});
		}
		const file = fileByKey.get(`${heichelId}	${seriesId}	${postId}`) || {};
		seriesMap.get(pair).posts.push({
			postId,
			postTitle: firstPostTitle(file, postId),
			commentCount: countFileComments(file),
			latestAt: latestStamp(file)
		});
	}

	const structure = [...seriesMap.values()].map(series => {
		series.posts.sort((a, b) => (b.latestAt || 0) - (a.latestAt || 0));
		return {
			heichelId: series.heichelId,
			heichelName: series.heichelName,
			seriesId: series.seriesId,
			title: series.title,
			postCount: series.posts.length,
			commentCount: series.posts.reduce((sum, post) => sum + post.commentCount, 0),
			posts: series.posts
		};
	});
	structure.sort((a, b) => b.commentCount - a.commentCount || a.title.localeCompare(b.title));

	cacheSet(aliasId, structure);
	return structure;
}

module.exports = { scanAliasStructure };
