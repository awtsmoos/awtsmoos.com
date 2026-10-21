//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PlatformFeedRoutesAffinity
 * @description
 * Sibling of PlatformFeedRoutes: series families and reading affinity, relocated verbatim.
 */

/** Series families for "related but still similar" expansion. */
const SERIES_FAMILIES = {
	chassidus: new Set([
		'chassidus', 'likkuteiSichos', 'likkuteiSichosVolume35', 'torahOhr',
		'torah-ohr-v6-rest', 'seferHatanya', 'likkuteiTorah', 'meluket',
		'sichosKodesh', 'derechMitzvosecha', 'seferHaMaamarim'
	]),
	tanach: new Set([
		'theWrittenTorah', 'tehillim', 'chumash', 'bereishis', 'shemos',
		'vayikra', 'bamidbar', 'devarim', 'neviim', 'kesuvim',
		'yehoshua', 'shoftim', 'shmuelAleph', 'shmuelBeis', 'melachimAleph',
		'melachimBeis', 'yeshayahu', 'yirmiyahu', 'yechezkel'
	]),
	oralTorah: new Set([
		'theOralTorah', 'mishnah', 'talmudBavli', 'mishnehTorah', 'yerushalmi',
		'halachah', 'midrash'
	])
};

/** Map a seriesId to its family name, or null. */
function seriesFamily(seriesId) {
	const s = String(seriesId || '');
	for (const [family, members] of Object.entries(SERIES_FAMILIES)) {
		if (members.has(s)) return family;
	}
	return null;
}

/**
 * Builds normalized affinity weights from reading history.
 * Returns { seriesWeight: Map(seriesId -> 0..1), familyWeight: Map(family -> 0..1), readPostIds: Set }.
 */
function buildAffinity(userId) {
	const seriesWeight = new Map();
	const familyWeight = new Map();
	const readPostIds = new Set();
	const deepReadSeries = new Set();

	try {
		const readingStore = require('../../reading/readingStore.js');

		// Recent sessions carry per-post signals.
		const sessions = readingStore.getRecentReads(userId, 50) || [];
		for (const s of sessions) {
			const postId = String(s.postId || '');
			if (postId) readPostIds.add(postId);
			const secs = Number(s.activeSeconds) || 0;
			const scroll = Number(s.maxScrollPercent) || 0;
			const sid = String(s.seriesId || '');
			if (!sid) continue;
			// Engagement weight: real seconds + completion bonus.
			const w = Math.log1p(secs / 30) + (scroll >= 80 ? 1.2 : scroll >= 50 ? 0.5 : 0);
			seriesWeight.set(sid, (seriesWeight.get(sid) || 0) + w);
			if (scroll >= 80) deepReadSeries.add(sid);
			const fam = seriesFamily(sid);
			if (fam) familyWeight.set(fam, (familyWeight.get(fam) || 0) + w * 0.6);
		}

		// Lifetime stats add durable series preference.
		const stats = readingStore.getStats(userId);
		const counts = (stats && stats.seriesCounts) || {};
		for (const [sid, count] of Object.entries(counts)) {
			const w = Math.log1p(Number(count) || 0) * 0.5;
			seriesWeight.set(sid, (seriesWeight.get(sid) || 0) + w);
			const fam = seriesFamily(sid);
			if (fam) familyWeight.set(fam, (familyWeight.get(fam) || 0) + w * 0.6);
			if (deepReadSeries.has(sid)) seriesWeight.set(sid, seriesWeight.get(sid) * 1.4);
		}
	} catch (_) {
		// No history or store unavailable — caller falls back to home ranking.
	}

	// Normalize to 0..1.
	const norm = (map) => {
		let max = 0;
		for (const v of map.values()) if (v > max) max = v;
		if (max <= 0) return map;
		for (const [k, v] of map) map.set(k, v / max);
		return map;
	};
	return { seriesWeight: norm(seriesWeight), familyWeight: norm(familyWeight), readPostIds };
}

module.exports = {
	SERIES_FAMILIES,
	seriesFamily,
	buildAffinity
};
