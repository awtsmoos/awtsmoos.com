// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/allocator/freeListBySize.js
 * @chapter The Smallest Fitting Chamber Opens First, Without Recounting The World
 * @description
 * Size-sorted companion index over the allocator's offset-sorted free list.
 *
 * allocate() used to linearly scan every free range on every allocate
 * (~0.4 ms at 48k ranges, ~1 ms at 200k) — and a flush does thousands of
 * allocates, so the scan dominated write cost and grew with every write,
 * because the free list only grows as retired structure fragments. This
 * index answers best-fit in O(log n + 32): binary search to the first
 * range that fits, then a bounded forward scan for the E1 preference
 * (fragment penalty, then smallest length, then smallest offset).
 *
 * The index holds COPIES of the ranges (never the live objects), so
 * in-place mutations to the free list cannot corrupt its order. The
 * indexed chooser verifies the chosen range against the free list
 * before consuming it, and rebuilds the index if the verification
 * fails — so any mutation path that bypasses the index can only cost
 * one rebuild, never a wrong allocation. The index is derived state:
 * it is rebuilt from the free list on first use and after any
 * wholesale free-list replacement; the persisted seal format is
 * unchanged. The bounded forward scan (32 entries) can miss a
 * penalty-0 range farther out, in which case at most 63 bytes of
 * dust are created — the same bound the old scan produced when no
 * penalty-0 range existed at all.
 */

const MAX_FORWARD_SCAN = 32;

function compareRange(a, b) {
	return (a.length - b.length) || (a.offset - b.offset);
}

function buildIndex(freeList) {
	const index = new Array(freeList.length);
	for (let i = 0; i < freeList.length; i++) {
		const r = freeList[i];
		index[i] = { offset: r.offset, length: r.length };
	}
	index.sort(compareRange);
	return index;
}

function indexInsert(index, range) {
	const key = { offset: range.offset, length: range.length };
	let lo = 0;
	let hi = index.length;
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (compareRange(index[mid], key) < 0) lo = mid + 1;
		else hi = mid;
	}
	index.splice(lo, 0, key);
}

function indexRemove(index, range) {
	let lo = 0;
	let hi = index.length;
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (compareRange(index[mid], range) < 0) lo = mid + 1;
		else hi = mid;
	}
	if (lo < index.length && index[lo].offset === range.offset && index[lo].length === range.length) {
		index.splice(lo, 1);
		return true;
	}
	return false;
}

function indexFindBest(index, size, minimumFragment = 64) {
	let lo = 0;
	let hi = index.length;
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (index[mid].length < size) lo = mid + 1;
		else hi = mid;
	}
	if (lo >= index.length) return null;
	if (index[lo].length === size) return index[lo];
	const best = index[lo];
	const bestRemainder = best.length - size;
	if (bestRemainder >= minimumFragment) return best;
	const end = Math.min(index.length, lo + MAX_FORWARD_SCAN);
	for (let i = lo + 1; i < end; i++) {
		const r = index[i];
		if (r.length - size >= minimumFragment) return r;
	}
	return best;
}

module.exports = {
	MAX_FORWARD_SCAN,
	buildIndex,
	compareRange,
	indexFindBest,
	indexInsert,
	indexRemove
};
