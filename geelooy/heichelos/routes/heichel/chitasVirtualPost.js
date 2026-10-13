// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chitasVirtualPost.js
 * @description
 * Server-side builder for Daily Chitas virtual posts (SEO + no error flash).
 *
 * Resolves /daily-chitas/post/chitas-YYYY-MM-DD into a complete post-like
 * object with full bilingual (Hebrew + English) verse units, so the server
 * renders the day's Chumash aliyah as real text — crawlers see it, readers
 * see it even with JavaScript disabled, and the client never flashes a
 * false "unavailable" error while hydrating.
 *
 * The beautiful loading overlay (client) is purely a visual experience
 * layer on top of this server-rendered text.
 */

const fs = require('fs');
const path = require('path');

const CHITAS_DIR = path.join(__dirname, '..', '..', 'heichel', 'modules', 'chitas');
const VERSES_DIR = path.join(CHITAS_DIR, 'verses');

// Hebcal: weekly parsha + festivals, same source the client uses.
const HEBCAL_ENDPOINT = 'https://www.hebcal.com/hebcal';

let cachedModules = null;
function chitasModules() {
	if (!cachedModules) {
		cachedModules = {
			hebrewDate: require(path.join(CHITAS_DIR, 'hebrew-date.js')),
			aliyotData: require(path.join(CHITAS_DIR, 'aliyot-data.js')),
			parshaNames: require(path.join(CHITAS_DIR, 'parsha-names-data.js')),
		};
	}
	return cachedModules;
}

/** chitas-2026-10-13 -> Date. Null when the postId is not a Chitas day. */
function parseChitasPostId(postId) {
	const m = /^chitas-(\d{4})-(\d{2})-(\d{2})$/.exec(String(postId || ''));
	if (!m) return null;
	const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0);
	return Number.isNaN(d.getTime()) ? null : d;
}

function toLocalDateKey(date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

async function fetchHebcalItems(date, israel) {
	const start = new Date(date); start.setDate(start.getDate() - 8);
	const end = new Date(date); end.setDate(end.getDate() + 35);
	const params = new URLSearchParams({
		v: '1', cfg: 'json',
		start: toLocalDateKey(start),
		end: toLocalDateKey(end),
		s: 'on', maj: 'on',
		i: israel ? 'on' : 'off',
	});
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 6000);
	try {
		const res = await fetch(`${HEBCAL_ENDPOINT}?${params}`, { signal: controller.signal });
		if (!res.ok) return [];
		const payload = await res.json();
		return Array.isArray(payload?.items) ? payload.items : [];
	} catch {
		return [];
	} finally {
		clearTimeout(timeout);
	}
}

function findParshaForDate(items, date) {
	const minimum = toLocalDateKey(date);
	return items.find(item => item?.category === 'parashat' && (!minimum || item.date >= minimum)) || null;
}

function normalizeParshaName(title, parshaNames) {
	let name = String(title || '').replace(/^Parashat\s+/i, '').trim();
	name = name.replace(/[‘’]/g, "'");
	if (parshaNames.PARSHA_NAME_MAP[name]) return parshaNames.PARSHA_NAME_MAP[name];
	return name;
}

function aliyotForParsha(parshaTitle, aliyotData, parshaNames) {
	const name = normalizeParshaName(parshaTitle, parshaNames);
	const { PARSHA_ALIYOT } = aliyotData;
	const { PARSHA_DOUBLES } = parshaNames;
	if (PARSHA_DOUBLES[name]) {
		const [first, second] = PARSHA_DOUBLES[name];
		const a = PARSHA_ALIYOT[first];
		const b = PARSHA_ALIYOT[second];
		if (!a || !b) return null;
		const combined = [
			...a.aliyot.slice(0, 3).map(x => ({ ...x, parshaEn: first, parshaHe: a.he })),
			...b.aliyot.slice(3, 7).map(x => ({ ...x, parshaEn: second, parshaHe: b.he })),
		];
		return combined.map((x, i) => ({ ...x, n: i + 1 }));
	}
	const entry = PARSHA_ALIYOT[name];
	if (!entry) return null;
	return entry.aliyot.map(x => ({ ...x, parshaEn: name, parshaHe: entry.he }));
}

const BOOK_SLUGS = {
	genesis: 'genesis', exodus: 'exodus', leviticus: 'leviticus',
	numbers: 'numbers', deuteronomy: 'deuteronomy',
};

function parseVerseRef(ref) {
	const m = String(ref || '').match(/^(\w+)\s+(\d+):(\d+)/);
	if (!m) return null;
	const slug = BOOK_SLUGS[m[1].toLowerCase()];
	if (!slug) return null;
	return { book: slug, chapter: m[2], verse: Number(m[3]) };
}

const chapterCache = new Map();
function loadChapter(book, chapter) {
	const key = `${book}/${chapter}`;
	if (chapterCache.has(key)) return chapterCache.get(key);
	try {
		const verses = JSON.parse(fs.readFileSync(path.join(VERSES_DIR, book, `${chapter}.json`), 'utf8'));
		chapterCache.set(key, Array.isArray(verses) ? verses : []);
	} catch {
		chapterCache.set(key, []);
	}
	return chapterCache.get(key);
}

function versesForAliyah(aliyah) {
	const s = parseVerseRef(aliyah.start);
	const e = parseVerseRef(aliyah.end);
	if (!s || !e || s.book !== e.book) return [];
	const out = [];
	const startCh = Number(s.chapter);
	const endCh = Number(e.chapter);
	for (let ch = startCh; ch <= endCh; ch++) {
		const verses = loadChapter(s.book, String(ch));
		for (const v of verses) {
			const vn = Number(String(v.v).replace(/\D/g, ''));
			if (ch === startCh && vn < s.verse) continue;
			if (ch === endCh && vn > e.verse) continue;
			out.push({ he: v.he, english: v.en, ref: `${ch}:${v.v}` });
		}
	}
	return out;
}

/**
 * Builds a complete virtual post for a Chitas day, or null when the postId
 * is not a Chitas day or the day's data cannot be resolved.
 */
async function buildChitasVirtualPost(postId, { israel = false } = {}) {
	const date = parseChitasPostId(postId);
	if (!date) return null;

	let mods;
	try {
		mods = chitasModules();
	} catch {
		return null;
	}

	const h = mods.hebrewDate.hebrewDateFromGregorian(date);
	const items = await fetchHebcalItems(date, israel);
	const parsha = findParshaForDate(items, date);
	if (!parsha) return null;

	const aliyot = aliyotForParsha(parsha.title, mods.aliyotData, mods.parshaNames);
	if (!aliyot) return null;
	// Sunday -> aliyah 1, ..., Saturday -> aliyah 7
	const aliyah = aliyot[date.getDay()];
	if (!aliyah) return null;

	const verses = versesForAliyah(aliyah);
	if (!verses.length) return null;

	const dateEn = date.toLocaleDateString('en-US', {
		weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
	});

	return {
		id: postId,
		postId,
		title: `Daily Chitas · ${aliyah.parshaEn} · Aliyah ${aliyah.n} (${aliyah.en}) — ${dateEn}`,
		heTitle: `חת״ת יומי · ${aliyah.parshaHe} · עליה ${aliyah.he}`,
		author: 'awtsmoos',
		corpus: 'chitas',
		kind: 'daily-study',
		translation_status: 'translated',
		translation_reviewed: true,
		publication_approved: true,
		dayuh: {
			chitasDate: toLocalDateKey(date),
			hebrewDate: `${h.day} ${h.monthHe} ${h.year}`,
			parsha: parsha.title,
			aliyah: aliyah.n,
			verseRange: `${aliyah.start} – ${aliyah.end}`,
			israel,
		},
		units: verses.map(v => ({ he: v.he, english: v.english })),
	};
}

module.exports = { buildChitasVirtualPost, parseChitasPostId };
