// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedConnectionsTitles
 * @description
 * Resolves a citing postId to a display title and canonical reader link.
 *
 * A packed-store suffix scan for the post record takes ~30s on production
 * (2 GiB shard, reverse scan), so it can never run unbounded per request.
 * Strategy:
 *   1. Instant structural label derived from the postId
 *      (e.g. "Tanya · Likutei Amarim · ch. 32") — always available.
 *   2. Race the packed lookup with a tight budget; when it wins, the real
 *      imported title and canonical /heichelos/<heichel>/post/<postId> link
 *      replace the label. The packed resolver's own cache makes later
 *      requests for the same post instant.
 * Links are only emitted when the heichel is known (verified mapping or
 * packed record) — never guessed.
 */

const { resolvePostRef } = require('./connectionsPosts.js');

const RESOLVE_BUDGET_MS = 1500;
const TITLE_CACHE_LIMIT = 5000;
const titleCache = new Map(); // postId -> { post, postTitle, heichel, href } (resolved winners only)

// Verified on production 2026-10-13 via /packed/read (packed keys
// /posts/<heichel>/<postId>): tanya/igeres/lt live in heichel "ikar",
// halachah-family posts in heichel "halachah".
const HEICHEL_BY_PREFIX = {
	'tanya-': 'ikar',
	'igeres-': 'ikar',
	'lt-': 'ikar',
	'halachah-': 'halachah',
	'mishnah-berurah-': 'halachah',
	'biur-halachah-': 'halachah',
	'shaar-hatziyun-': 'halachah'
};

const TANYA_PARTS = { la: 'Likutei Amarim', it: 'Igeres HaTeshuvah', ka: 'Kuntres Acharon', sh: "Shaar HaYichud VehaEmunah" };
const HALACHAH_WORKS = { sa: 'Shulchan Aruch', tur: 'Tur', saharav: 'Shulchan Aruch HaRav' };
const HALACHAH_SECTIONS = { orachchaim: 'Orach Chaim', yorehdeah: 'Yoreh Deah', evenhaezer: 'Even HaEzer', choshenmishpat: 'Choshen Mishpat' };

/** @description Title-cases a slug: bamidbar -> Bamidbar, shemini-atzeret -> Shemini Atzeret. @param {string} slug Slug. @returns {string} Title. */
function titleSlug(slug) {
	return String(slug).split('-').map((w) => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
}

/** @description Heichel for a postId from the verified prefix table. @param {string} postId Post id. @returns {string|null} Heichel. */
function heichelFor(postId) {
	for (const prefix of Object.keys(HEICHEL_BY_PREFIX)) {
		if (postId.startsWith(prefix)) return HEICHEL_BY_PREFIX[prefix];
	}
	return null;
}

/**
 * @description Builds the instant structural label + link for a postId.
 * @param {string} postId Post identifier.
 * @returns {{post: string, postTitle: string, heichel: string|null, href: string|null}} Reference.
 */
function patternRef(postId) {
	const id = String(postId);
	const heichel = heichelFor(id);
	const href = heichel ? '/heichelos/' + heichel + '/post/' + id : null;
	let label = id;
	let m;
	if ((m = id.match(/^tanya-he-([a-z]+)-(\d+)$/))) {
		label = 'Tanya · ' + (TANYA_PARTS[m[1]] || m[1]) + ' · ch. ' + parseInt(m[2], 10);
	} else if ((m = id.match(/^igeres-he-v(\d+)-(\d+)$/))) {
		label = 'Igeres HaKodesh · v. ' + parseInt(m[1], 10) + ' · Letter ' + parseInt(m[2], 10);
	} else if ((m = id.match(/^lt-([a-z-]+)-ch(\d+)$/))) {
		label = 'Likkutei Torah · ' + titleSlug(m[1]) + ' · ch. ' + parseInt(m[2], 10);
	} else if ((m = id.match(/^halachah-(sa|tur|saharav)-([a-z]+)(?:-[a-z0-9-]+)?-(\d+)$/))) {
		label = (HALACHAH_WORKS[m[1]] || 'Halachah') + ' · ' + (HALACHAH_SECTIONS[m[2]] || titleSlug(m[2])) + ' · ' + parseInt(m[3], 10);
	} else if ((m = id.match(/^(mishnah-berurah|biur-halachah|shaar-hatziyun)(?:-([a-z]+))?-([a-z]+)-(\d+)$/))) {
		const work = { 'mishnah-berurah': 'Mishnah Berurah', 'biur-halachah': 'Biur Halachah', 'shaar-hatziyun': "Shaar HaTziyun" }[m[1]];
		const section = m[3] === 'oc' ? 'Orach Chaim' : (HALACHAH_SECTIONS[m[3]] || titleSlug(m[3]));
		label = work + ' · ' + section + ' · ' + parseInt(m[4], 10);
	}
	return { post: id, postTitle: label, heichel, href };
}

/**
 * @description Resolves one post reference: instant pattern label, upgraded
 * to the real packed title when the lookup wins its time budget.
 * @param {Object} $i Active Awtsmoos request interface.
 * @param {string} postId Post identifier.
 * @returns {Promise<{post: string, postTitle: string, heichel: string|null, href: string|null}>} Reference.
 */
async function resolveTitle($i, postId) {
	const id = String(postId || '').trim();
	if (!id) return { post: id, postTitle: id, heichel: null, href: null };
	const hit = titleCache.get(id);
	if (hit) return hit;

	const fallback = patternRef(id);
	let winner = null;
	try {
		winner = await Promise.race([
			resolvePostRef($i, id),
			new Promise((resolve) => setTimeout(() => resolve(null), RESOLVE_BUDGET_MS))
		]);
	} catch (_) {
		winner = null;
	}
	// A packed "hit" that only echoes the postId back is not an upgrade.
	const upgraded = winner && winner.postTitle && winner.postTitle !== id ? winner : null;
	const out = upgraded || fallback;
	if (upgraded) {
		if (titleCache.size >= TITLE_CACHE_LIMIT) titleCache.delete(titleCache.keys().next().value);
		titleCache.set(id, out);
	}
	return out;
}

/** @description Clears the title cache (tests only). @returns {void} */
function clearTitleCache() {
	titleCache.clear();
}

module.exports = { resolveTitle, patternRef, clearTitleCache, HEICHEL_BY_PREFIX };
