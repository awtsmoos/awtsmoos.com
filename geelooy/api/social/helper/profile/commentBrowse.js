// B"H
// Boruch Hashem
/**
 * @module ProfileCommentBrowse
 * @description
 * The Awtsmoos lets every alias reveal its whole comment harvest organized by
 * Heichel -> series -> post, so the public profile can browse and search it all;
 * Awtsmoos.com keeps every doorway paginated and bounded while the Awtsmoos keeps nothing hidden.
 *
 * Ground truth is the heichelos comment tree
 *   <sp>/heichelos/<heichelId>/comments/atSeries/<seriesId>/atPost/<postId>/<aliasId>
 * unioned with the alias-side comment index
 *   <sp>/aliases/<aliasId>/comments/heichel/<heichelId>/series/<seriesId>/atPost
 * so imports that bypass the alias index still appear.
 */

const { paths, read } = require("./paths.js");
const { cleanText, idList } = require("./sanitize.js");

const STRUCTURE_TTL_MS = 45000;
const CHUNK = 25;
const structureCache = new Map(); // aliasId -> { at, structure }

function cacheGet(aliasId) {
	const hit = structureCache.get(aliasId);
	if (hit && Date.now() - hit.at < STRUCTURE_TTL_MS) return hit.structure;
	return null;
}

function cacheSet(aliasId, structure) {
	structureCache.set(aliasId, { at: Date.now(), structure });
	if (structureCache.size > 40) {
		let oldestKey = null;
		let oldestAt = Infinity;
		for (const [key, value] of structureCache) {
			if (value.at < oldestAt) {
				oldestAt = value.at;
				oldestKey = key;
			}
		}
		if (oldestKey) structureCache.delete(oldestKey);
	}
}

async function chunked(items, size, fn) {
	const out = [];
	for (let i = 0; i < items.length; i += size) {
		const batch = await Promise.all(items.slice(i, i + size).map(fn));
		out.push(...batch);
	}
	return out;
}

function countFileComments(file) {
	let n = 0;
	if (!file || typeof file !== "object") return 0;
	for (const vs of idList(file)) {
		const list = file[vs];
		if (Array.isArray(list)) n += list.length;
	}
	return n;
}

function firstPostTitle(file, postId) {
	if (!file || typeof file !== "object") return String(postId);
	for (const vs of idList(file)) {
		const list = file[vs];
		if (Array.isArray(list)) {
			for (const comment of list) {
				const title = cleanText(comment && comment.postTitle, 120);
				if (title) return title;
			}
		}
	}
	return String(postId);
}

function latestStamp(file) {
	let latest = 0;
	if (!file || typeof file !== "object") return 0;
	for (const vs of idList(file)) {
		const list = file[vs];
		if (Array.isArray(list)) {
			for (const comment of list) {
				const stamp = Number((comment && (comment.timestamp || comment.createdAt)) || 0);
				if (stamp > latest) latest = stamp;
			}
		}
	}
	return latest;
}

function flattenFileComments({ file, aliasId, heichelId, heichelName, seriesId, seriesTitle, postId, postTitle }) {
	const out = [];
	if (!file || typeof file !== "object") return out;
	for (const verseSection of idList(file)) {
		const list = file[verseSection];
		if (!Array.isArray(list)) continue;
		for (const comment of list) {
			out.push({
				id: (comment && (comment.id || comment.commentId)) || `${postId}-${verseSection}`,
				aliasId,
				heichelId,
				heichelName,
				seriesId,
				seriesTitle,
				postId,
				postTitle: cleanText((comment && comment.postTitle) || postTitle || postId, 120),
				postUrl: `/heichelos/${heichelId}/series/${seriesId}/post/${postId}`,
				verseSection: String(verseSection),
				segmentId: (comment && ((comment.dayuh && comment.dayuh.segmentId) || comment.segmentId)) || "",
				content: cleanText((comment && (comment.content || (comment.dayuh && comment.dayuh.content))) || "", 8000),
				createdAt: Number((comment && (comment.timestamp || comment.createdAt)) || 0),
				repliesCount: Array.isArray(comment && comment.replies) ? comment.replies.length : 0,
				likesCount: Number((comment && comment.likesCount) || 0)
			});
		}
	}
	return out;
}

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

function findSeries(structure, seriesId) {
	return structure.find(s => s.seriesId === seriesId) || null;
}

async function commentSeriesByAlias({ $i, aliasId }) {
	const structure = await scanAliasStructure($i, aliasId);
	return structure.map(({ posts, ...rest }) => rest);
}

async function commentPostsByAlias({ $i, aliasId, seriesId }) {
	const structure = await scanAliasStructure($i, aliasId);
	const series = findSeries(structure, seriesId);
	if (!series) return [];
	return series.posts.map(post => ({
		heichelId: series.heichelId,
		heichelName: series.heichelName,
		seriesId: series.seriesId,
		seriesTitle: series.title,
		postId: post.postId,
		postTitle: post.postTitle,
		postUrl: `/heichelos/${series.heichelId}/series/${series.seriesId}/post/${post.postId}`,
		commentCount: post.commentCount,
		latestAt: post.latestAt
	}));
}

async function commentsByAliasPost({ $i, aliasId, seriesId, postId, limit = 100, offset = 0 }) {
	const structure = await scanAliasStructure($i, aliasId);
	const series = findSeries(structure, seriesId);
	const safeLimit = Math.max(1, Math.min(500, Number(limit) || 100));
	const safeOffset = Math.max(0, Number(offset) || 0);
	if (!series) return { total: 0, limit: safeLimit, offset: safeOffset, items: [] };
	const file = await read($i, paths.commentAliasPost(series.heichelId, seriesId, postId, aliasId), {});
	const post = series.posts.find(p => p.postId === postId);
	const items = flattenFileComments({
		file,
		aliasId,
		heichelId: series.heichelId,
		heichelName: series.heichelName,
		seriesId,
		seriesTitle: series.title,
		postId,
		postTitle: (post && post.postTitle) || postId
	}).sort((a, b) => {
		const sectionDiff = Number(a.verseSection) - Number(b.verseSection);
		if (sectionDiff) return sectionDiff;
		return String(a.segmentId).localeCompare(String(b.segmentId));
	});
	return { total: items.length, limit: safeLimit, offset: safeOffset, items: items.slice(safeOffset, safeOffset + safeLimit) };
}

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

module.exports = {
	commentSeriesByAlias,
	commentPostsByAlias,
	commentsByAliasPost,
	searchCommentsByAlias
};
