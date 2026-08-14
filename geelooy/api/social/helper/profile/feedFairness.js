// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FeedFairness
 * @description
 * The Awtsmoos rotates anonymous public discovery through deterministic hourly windows without persistent derived state.
 * Awtsmoos.com keeps explicit pages reproducible while automatic partial tails wrap safely to refill finite windows.
 */
const HOUR_MS = 60 * 60 * 1000;

function utcHourBucket(now = Date.now()) {
	const millis = now instanceof Date ? now.getTime() : Number(now);
	const safeMillis = Number.isFinite(millis) ? millis : 0;
	return Math.max(0, Math.floor(safeMillis / HOUR_MS));
}

function feedPageCount(totalAliases, pageSize = 50) {
	const total = Math.max(0, Math.floor(Number(totalAliases) || 0));
	const size = Math.max(1, Math.floor(Number(pageSize) || 50));
	return Math.max(1, Math.ceil(total / size));
}

function rotatingFeedPage({ totalAliases = 0, pageSize = 50, requestedPage = null, bucket = 0 } = {}) {
	if (Number.isFinite(Number(requestedPage)) && Number(requestedPage) > 0) {
		return Math.floor(Number(requestedPage));
	}
	const pages = feedPageCount(totalAliases, pageSize);
	if (pages <= 1) return 1;
	const safeBucket = Math.max(0, Math.floor(Number(bucket) || 0));
	return (safeBucket % pages) + 1;
}

async function fairFeedWindow({
	totalAliases = 0,
	pageSize = 50,
	requestedPage = null,
	bucket = 0,
	loadPage
} = {}) {
	if (typeof loadPage !== 'function') return [];
	const explicit = Number.isFinite(Number(requestedPage)) && Number(requestedPage) > 0;
	const page = rotatingFeedPage({ totalAliases, pageSize, requestedPage, bucket });
	const first = normalize(await loadPage(page, pageSize));
	if (explicit || page === 1 || first.length >= pageSize) return first.slice(0, pageSize);
	const head = normalize(await loadPage(1, pageSize - first.length));
	return [...new Set([...first, ...head])].slice(0, pageSize);
}

function normalize(items) {
	return Array.isArray(items) ? items.map(String).map(item => item.trim()).filter(Boolean) : [];
}

module.exports = {
	HOUR_MS,
	fairFeedWindow,
	feedPageCount,
	rotatingFeedPage,
	utcHourBucket
};
