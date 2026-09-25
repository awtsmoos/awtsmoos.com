// B"H
/**
 * Boruch Hashem. Blessed is He.
 *
 * @file importPlanner.js
 * @description
 * The Awtsmoos knows every letter at once; Awtsmoos.com still needs a map.
 * This planner matches authorized source records only to existing Ayin Beis
 * posts, so abundance never becomes accidental duplication.
 */

const { contentHash, normalizeTitle } = require('./authorizedBundle.js');

/** Read one series post map through the project's normal database contract. */
async function readSeriesPosts(db, heichelId, seriesId) {
	const seriesPath = `/social/heichelos/${heichelId}/series/${seriesId}/posts`;
	try {
		const value = await db.get(seriesPath, { max: true });
		return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
	} catch {
		return {};
	}
}

/** Build a normalized-title lookup that preserves ambiguity as multiple IDs. */
function titleIndex(posts) {
	const output = new Map();
	for (const [postId, post] of Object.entries(posts)) {
		const key = normalizeTitle(post?.title);
		if (!key) continue;
		const ids = output.get(key) || [];
		ids.push(postId);
		output.set(key, ids);
	}
	return output;
}

/** Classify one authorized record against the existing destination. */
function classifyRecord(record, posts, titles, replaceNonempty) {
	if (!record.content) return { action: 'skip-empty-source', reason: 'source-content-empty' };
	let targetPostId = record.targetPostId;
	if (targetPostId && !posts[targetPostId]) return { action: 'missing-target', targetPostId, reason: 'explicit-target-not-found' };
	if (!targetPostId) {
		const matches = titles.get(normalizeTitle(record.title)) || [];
		if (matches.length > 1) return { action: 'conflict-ambiguous', reason: 'title-matches-multiple-posts' };
		if (!matches.length) return { action: 'missing-target', reason: 'title-not-found' };
		[targetPostId] = matches;
	}
	const targetPost = posts[targetPostId];
	const targetContent = typeof targetPost?.content === 'string' ? targetPost.content : '';
	const targetHash = contentHash(targetContent);
	if (targetHash === record.contentHash) return { action: 'unchanged', targetPostId, targetHash };
	if (!targetContent) return { action: 'fill-empty', targetPostId, targetHash };
	if (replaceNonempty) return { action: 'replace', targetPostId, targetHash };
	return { action: 'conflict-nonempty', targetPostId, targetHash, reason: 'destination-has-different-content' };
}

/** Build a deterministic import plan across the declared series. */
async function buildImportPlan({ db, bundle, heichelId = 'ikar', replaceNonempty = false }) {
	const seriesIds = [...new Set(bundle.records.map(record => record.seriesId))];
	const series = new Map();
	for (const seriesId of seriesIds) {
		const posts = await readSeriesPosts(db, heichelId, seriesId);
		series.set(seriesId, { posts, titles: titleIndex(posts) });
	}
	const items = bundle.records.map(record => {
		const destination = series.get(record.seriesId);
		const classified = classifyRecord(record, destination.posts, destination.titles, replaceNonempty);
		return { ...classified, record, targetPost: classified.targetPostId ? destination.posts[classified.targetPostId] : null };
	});
	const counts = {};
	for (const item of items) counts[item.action] = (counts[item.action] || 0) + 1;
	const blockers = items.filter(item => ['missing-target', 'conflict-ambiguous', 'conflict-nonempty'].includes(item.action));
	return { heichelId, replaceNonempty, items, counts, blockers };
}

/** Strip full text and destination bodies from a human/machine-readable report. */
function summarizePlan(plan) {
	return {
		heichelId: plan.heichelId,
		replaceNonempty: plan.replaceNonempty,
		counts: plan.counts,
		blockers: plan.blockers.length,
		items: plan.items.map(item => ({
			sourceId: item.record.sourceId,
			seriesId: item.record.seriesId,
			title: item.record.title,
			targetPostId: item.targetPostId || '',
			action: item.action,
			sourceHash: item.record.contentHash,
			targetHash: item.targetHash || '',
			contentChars: item.record.content.length,
			reason: item.reason || ''
		}))
	};
}

module.exports = { buildImportPlan, classifyRecord, readSeriesPosts, summarizePlan, titleIndex };
