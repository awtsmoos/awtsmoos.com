//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Canonical zero-network discovery for the Ikar Torah library root.
 * @description The Awtsmoos lets permanent Torah doors exist before databases wake.
 *
 * B"H 2026-11-09: every `count` below is a real measured number, not a guess.
 * Sections are the live subSeries registration
 * (GET /api/social/heichelos/ikar/series/<id>/subSeries?details=true);
 * posts are the exact union of the packed allPosts index and the native
 * series store (packed ∪ native, deduped by postId, verified 2026-11-09
 * against /mnt/HC_Volume_102267213/dayuhChadash; whole-ikar union 15,438):
 * - theWrittenTorah: 39 books, 929 chapter posts (native-only, per-book
 *   counts match the Nov 6 census exactly).
 * - theOralTorah: 7 sections, 0 posts in every one.
 * - chassidus: 21 sections; 3,759 posts in the subtree (13 sections render
 *   — 8 are proven-empty stubs hidden by sourceAvailability.js — but the
 *   21 are registered; the 3,759 is the exact subtree union).
 * - halacha: 10 sections, 0 posts in every one (leaf-empty).
 * - midrash: 1 section (rashi-midrash-bereshit-rabbah), 20 posts, mirrored
 *   in both stores. The 14 other midrash-* native dirs hold only a 1-byte
 *   placeholder and zero posts — they are not listed anywhere.
 * - kabbalah / mussar: no standalone series exists in ikar
 *   (SERIES_NOT_FOUND); the counts are the works their pages actually list
 *   via specialTorahDiscovery.js (5 / 3 links, every target verified live).
 *   If that list changes, update these counts with it.
 * - torah-language-tools: a tool, not a collection — no post count exists.
 * - daily-chitas: virtual series; 4 daily portions (Chumash, Tanya,
 *   Tehillim, Rambam — see modules/chitas/virtual-series.js).
 * Re-census these numbers whenever library content changes; the tests pin
 * them so a stale count fails loudly instead of lying quietly.
 */
const IKAR_ROOT_SERIES = Object.freeze([
	{
		id: 'theWrittenTorah',
		title: 'תורה שבכתב · The Written Torah',
		description: 'The Entire Torah that Moishe and prophets got from the Creator.',
		count: '39 books · 929 chapters'
	},
	{
		id: 'theOralTorah',
		title: 'תורה שבעל פה · The Oral Torah',
		description: 'The Oral Torah.',
		count: '7 sections · no posts yet'
	},
	{
		id: 'chassidus',
		title: 'חסידות · Chassidus',
		description: 'תורת החסידות, שיחות ומאמרים · Chassidus, sichos, and maamarim.',
		count: '21 sections · 3,759 posts'
	},
	{
		id: 'halacha',
		title: 'הלכה · Halacha',
		description: 'הלכה למעשה · Practical Halacha.',
		count: '10 sections · no posts yet'
	},
	{
		id: 'midrash',
		title: 'מדרש · Midrash',
		description: 'מדרשי אגדה והלכה · Aggadic and Halachic Midrash.',
		count: '1 section · 20 posts'
	},
	{
		id: 'kabbalah',
		title: 'קבלה · Kabbalah',
		description: 'תורת הקבלה · The Kabbalah.',
		count: '5 works'
	},
	{
		id: 'mussar',
		title: 'מוסר · Mussar',
		description: 'ספרי מוסר · Mussar works.',
		count: '3 works'
	},
	{
		id: 'torah-language-tools',
		title: 'תרגומים ומילון · Translations & Dictionary',
		description: 'תרגומים, מילונים וכלים · Translations, dictionaries, and tools.',
		count: 'Translation hub & search'
	},
	{
		id: 'daily-chitas',
		title: 'חת״ת יומי · Daily Chitas',
		description: 'חת״ת יומי · Daily Chitas.',
		count: '4 portions · every day'
	}
]);

function getIkarRootDiscovery() {
	return {
		links: IKAR_ROOT_SERIES.map(series => ({
			kind: 'series',
			title: series.title,
			description: series.description,
			count: series.count,
			path: `/heichelos/ikar/series/${series.id}`
		}))
	};
}

module.exports = {
	IKAR_ROOT_SERIES,
	getIkarRootDiscovery
};
