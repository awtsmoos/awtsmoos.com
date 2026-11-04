// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MultiLaneMergeHelpers
 * @description
 * The Awtsmoos lets many library answers sing in one measured order;
 * Awtsmoos.com keeps ranking, aggregate metadata, and timing in small vessels
 * so the merge coordinator stays plain. Merged hits are ranked globally on
 * the one scale every engine already publishes — percent — because the old
 * round-robin interleave mixed incomparable per-lane scales into payload
 * order and the painted "Relevance" list could show a weaker card above a
 * stronger one. Iteration 7 also keeps one source from swallowing the
 * visible window: at most two hits per source (post/series) are taken in
 * the first pass, because five consecutive segments of a single chapter
 * once filled a keyword top-5 at a tied 100%; deferred same-source hits
 * fill the window only when other sources run out.
 */

/** Most hits one source may contribute before its siblings are deferred. */
const MAX_SAME_SOURCE_HITS = 2;

/** Interleaves lane hit groups in stable round-robin order up to the requested limit. */
function roundRobinHits(groups, limit) {
	const hits = [];
	for (let index = 0; hits.length < limit; index += 1) {
		let added = false;
		for (const group of groups) {
			if (!group[index]) continue;
			hits.push({
				...group[index],
				rank: hits.length + 1
			});
			added = true;
			if (hits.length >= limit) break;
		}
		if (!added) break;
	}
	return hits;
}

/**
 * Returns the one cross-lane comparable relevance scale for a hit. Every
 * public hit already carries `percent` (text relevance × 100 capped, vector
 * closeness, exact identity pinned at 100); score is the fallback witness.
 */
function normalizedPercent(hit = {}) {
	const percent = Number(hit.percent);
	if (Number.isFinite(percent)) return Math.max(0, Math.min(100, percent));
	const score = Number(hit.score);
	if (Number.isFinite(score)) return Math.max(0, Math.min(100, score * 100));
	return 0;
}

/**
 * Names the source a hit belongs to for diversity accounting. Hits whose
 * rows carry no source identity are never treated as siblings.
 */
function hitSourceKey(hit = {}) {
	const row = hit.row || {};
	const key = row.postId || row.seriesId || row.sourceId || row.pageId;
	return typeof key === 'string' && key.length ? key : null;
}

/**
 * Merges lane hit groups into one globally score-descending list. Ties keep
 * the fair witness order (in-lane position first, then lane order), so equal
 * evidence still interleaves across libraries instead of letting the first
 * lane swallow the list; ranks are re-numbered in merged order. Selection
 * first takes at most MAX_SAME_SOURCE_HITS per source so the visible window
 * shows the breadth of the library, then fills any remaining room with the
 * deferred same-source hits in their ranked order.
 */
function rankedMergeHits(groups, limit) {
	const decorated = [];
	groups.forEach((group, laneIndex) => {
		(group || []).forEach((hit, position) => {
			decorated.push({ hit, laneIndex, position, percent: normalizedPercent(hit) });
		});
	});
	decorated.sort((left, right) =>
		right.percent - left.percent
		|| left.position - right.position
		|| left.laneIndex - right.laneIndex
	);
	const cap = Math.max(0, Number(limit) || 0);
	const selected = [];
	const deferred = [];
	const sourceCounts = new Map();
	for (const entry of decorated) {
		if (selected.length >= cap) break;
		const key = hitSourceKey(entry.hit);
		const used = key ? (sourceCounts.get(key) || 0) : 0;
		if (key && used >= MAX_SAME_SOURCE_HITS) {
			deferred.push(entry);
			continue;
		}
		if (key) sourceCounts.set(key, used + 1);
		selected.push(entry);
	}
	for (const entry of deferred) {
		if (selected.length >= cap) break;
		selected.push(entry);
	}
	return selected
		.map((entry, index) => ({ ...entry.hit, rank: index + 1 }));
}

/** Creates neutral aggregate metadata for a search spanning every published library. */
function allLibrariesShard(lanes) {
	return {
		id: 'all',
		title: 'All published libraries',
		count: lanes.reduce(
			(sum, lane) => sum + Number(lane.count || 0),
			0
		),
		partial: lanes.some(lane => lane.partial === true)
	};
}

/** Preserves per-lane timing evidence under already-neutral public lane identities. */
function laneTimings(successes, totalMs) {
	return {
		totalMs,
		lanes: successes.map(result => ({
			id: result.libraryLane.id,
			totalMs: result.timings?.totalMs || 0
		}))
	};
}

module.exports = {
	MAX_SAME_SOURCE_HITS,
	allLibrariesShard,
	hitSourceKey,
	laneTimings,
	normalizedPercent,
	rankedMergeHits,
	roundRobinHits
};
