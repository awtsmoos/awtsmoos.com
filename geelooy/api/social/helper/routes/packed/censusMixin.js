//B"H
//Blessed is He
//Boruch Hashem

/** @module CensusMixin
 * Reliable post census for PackedPostImportRoutes.
 *
 * GET /api/social/packed/census?heichel=<id>[&series=<id>][&cursor=<opaque>]
 *     [&limit=200][&missing=translation|studyGuide|any|issues][&flag=<issue-flag>]
 *     [&summary=1]
 *
 * Why this exists (2026-10-21): the public series post-LIST endpoint unions
 * two incomplete sources (the native DosDB key listing and the packed
 * allPosts grouped index) behind a 60s ID cache, so its counts drift
 * (biur-halachah-hebrew was observed at 525, 140 and 509 for identical
 * content) and its /details variant can hang past the gateway timeout
 * while every post reads fine directly. This endpoint is the enumeration
 * of record:
 *
 *   - Membership comes from the packed allPosts grouped index (the import
 *     system of record), already cached in-process and stat/generation
 *     validated by allPostsGrouped — never from the lossy series index.
 *   - With &series=, membership is unioned with the native series post
 *     keys for that one series, so native-only posts are counted too and
 *     flagged source:"native".
 *   - Translation / studyGuide / issue status comes from a per-post POINT
 *     read (packed core key index, then the native series child) — one
 *     post at a time, bounded concurrency, each full record discarded
 *     right after its projection is taken. Nothing whole-heichel loads.
 *   - Paging is offset-based over a postId-sorted candidate list, so a
 *     full census of a heichel is a sequence of small, resumable pages.
 *     Filtered and summary calls scan from the cursor until the page is
 *     full, the candidate list ends, or a per-request scan budget
 *     (20s / 2000 candidates) is hit — partial progress always returns a
 *     nextCursor instead of hanging.
 *
 * ISSUE FLAGS (2026-10-21, user order: any AI agent must be able to
 * discover ALL remaining post issues from this endpoint, no scraping):
 * every record carries `issues: [...]` (empty = clean). Computed flags:
 *   missing_english            any unit with empty english, or the
 *                              translation.readable shape empty
 *   hebrew_only                no English anywhere in the post
 *   missing_study_guide        studyGuide absent or empty
 *   missing_phrase_translations  the post's format carries phrase
 *                              translations but they are absent/empty
 *   unreadable                 membership exists but no readable record
 *   empty_post                 readable record with no content in any
 *                              known field (stubs, placeholder shells)
 *   translation_status_mismatch  the stored translation_status field
 *                              clearly contradicts the measured content
 *                              (claims bilingual, zero English — or
 *                              claims none, English present)
 *   series_missing_prateem     (filtered-series calls only) the series
 *                              has no native prateem record, so it is
 *                              undiscoverable in the series tree
 *   undefined_description      (filtered-series calls only) the series
 *                              prateem description is literally the
 *                              string "undefined"
 * &flag=<name> filters list mode to posts carrying that one flag
 * (summary mode always aggregates every flag into issueCounts).
 * Every response also carries `knownQuirks`: platform behaviors an
 * agent must know (wrong-series read routing, series-list truncation,
 * native-store census coverage, the lying status field).
 * Registry flags (external defective sets, e.g. textheb_displaced,
 * held_footnotes, not_discoverable) are merged from censusFlags.json,
 * a sibling JSON file: { "postIds": { "<postId>": ["flag", ...] },
 * "series": { "<heichel>/<seriesId>": ["flag", ...] } }. The registry is
 * re-read whenever its mtime changes, so dropping in a new file takes
 * effect with no restart. missing=issues returns only posts with at
 * least one flag; summary mode reports per-issue counts per series.
 */

const fs = require('fs');
const path = require('path');
const { requireMethod, requestValue } = require('./requestValues.js');
const { myOpts } = require('../../general.js');

/**
 * Caller identity for the multi-user auth model (2026-10-21): agents act
 * AS the authorizing account. Operator-grade auth (Ed25519 signature,
 * operator key, or the admin OAuth identity) sees the full heichel;
 * any other authenticated OAuth identity is scoped to its OWN posts
 * (post aliasId in the caller's alias list). Worker I's shared helper
 * will supersede resolveCaller below — the census only depends on its
 * { identity, isAdmin, via } shape, so the swap is a one-function edit.
 */
function tryBearer($i) {
	try {
		const { readBearer } = require('../../../../oauth/core/tokenReader.js');
		const resolved = readBearer($i);
		if (!resolved || !resolved.ok) return null;
		const entry = resolved.entry || {};
		const userId = String(entry.userId || entry.accountId || '');
		return userId ? { userId } : null;
	} catch (_) { return null; }
}

async function callerAliases($i, identity) {
	const scope = new Set([identity]);
	try {
		const list = await $i.db.get(`/users/${identity}/aliases/`, myOpts($i));
		if (Array.isArray(list)) for (const a of list) if (a) scope.add(String(a));
	} catch (_) { /* alias list unreadable: identity-only scope, fail closed */ }
	return scope;
}
const { getGroupedEntry } = require('../../packed/allPostsGrouped.js');
const { findKeyReverseAsync, findKeySuffixReverseAsync } = require('../../packed/socialPacked.js');

const SCAN_BUDGET_MS = 20000;
const SCAN_BUDGET_MAX = 2000;
const READ_CONCURRENCY = 6;
const REGISTRY_FILE = path.join(__dirname, 'censusFlags.json');
let registryCache = { mtimeMs: -1, byPost: new Map(), bySeries: new Map() };

/**
 * Orphan (not_discoverable) series set: censusOrphans.json, a sibling
 * data file { "<heichel>": ["<seriesId>", ...] } produced by diffing the
 * packed grouped membership against the public discovery graph (root
 * series list + recursive subSeries — the tree the front end renders).
 * Regenerated by the orphan-detector run, never hand-edited; re-read on
 * mtime change like the flag registry.
 */
const ORPHANS_FILE = path.join(__dirname, 'censusOrphans.json');
let orphansCache = { mtimeMs: -1, set: new Set() };
function loadOrphans() {
	try {
		const st = fs.statSync(ORPHANS_FILE);
		if (st.mtimeMs === orphansCache.mtimeMs) return orphansCache;
		const parsed = JSON.parse(fs.readFileSync(ORPHANS_FILE, 'utf8'));
		const set = new Set();
		for (const [h, sids] of Object.entries(parsed || {})) {
			if (Array.isArray(sids)) for (const sid of sids) set.add(`${h}/${sid}`);
		}
		orphansCache = { mtimeMs: st.mtimeMs, set };
	} catch (_) { /* no orphan data yet */ }
	return orphansCache;
}

function loadRegistry() {
	try {
		const st = fs.statSync(REGISTRY_FILE);
		if (st.mtimeMs === registryCache.mtimeMs) return registryCache;
		const parsed = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
		const clean = (flags) => (Array.isArray(flags) ? flags : []).filter(e =>
			typeof e === 'string' || (e && typeof e === 'object' && typeof e.flag === 'string'));
		const byPost = new Map();
		for (const [pid, flags] of Object.entries(parsed.postIds || {})) {
			const c = clean(flags);
			if (c.length) byPost.set(String(pid), c);
		}
		const bySeries = new Map();
		for (const [key, flags] of Object.entries(parsed.series || {})) {
			const c = clean(flags);
			if (c.length) bySeries.set(String(key), c);
		}
		registryCache = { mtimeMs: st.mtimeMs, byPost, bySeries };
	} catch (_) { /* no registry yet: computed flags only */ }
	return registryCache;
}

/**
 * Platform quirks every census consumer must know (returned verbatim in
 * every census response as `knownQuirks`). Verified live 2026-10-22 by
 * the api-core crew unless dated otherwise.
 */
const KNOWN_QUIRKS = [
	{
		id: 'wrong_series_routing',
		detail: 'GET /api/social/heichelos/{h}/series/{s}/post/{p} resolves by postId and IGNORES a mismatched series segment (verified live on ikar and rambam: a post reads fine under a wrong series). The seriesId in each census record is the post\'s true series — never treat a read URL\'s series segment as authoritative.'
	},
	{
		id: 'series_list_truncation',
		detail: 'The public series post-LIST endpoints under-report and truncate (a union of two incomplete sources behind an ID cache; the same series has returned 525, 140 and 509 IDs for identical content). Census totals and per-series counts here are the enumeration of record; a list count is never proof of absence.'
	},
	{
		id: 'census_native_coverage',
		detail: 'Census membership comes from the packed grouped index (plus, for one filtered series, the native key listing). Series whose posts live only in the native store can under-enumerate while the DosDB FS-bridge getObjectKeys divergence stands (observed: bavli-hebrew returned 0 candidates against 1,237 live commentary posts). A 0-candidate result is not proof a series is empty — verify by direct reads.'
	},
	{
		id: 'translation_status_field_lies',
		detail: 'A post\'s stored translation_status can contradict its content. Census computes its own verdict per post and flags clear contradictions as translation_status_mismatch; string-compare content, never trust the field.'
	}
];

/**
 * Series-record ("prateem") point read in the native reader's proven
 * order. Returns the record object, or null when every read form comes
 * back empty (record absent). Throws are swallowed per form; a caller
 * that needs "store could not answer" semantics treats an all-empty
 * result as absent ONLY for explicitly filtered series (bounded blast
 * radius: one series per call).
 */
async function readSeriesPrateem($i, heichel, sid) {
	const parent = `/social/heichelos/${heichel}/series/${sid}`;
	const ok = (v) => v && typeof v === 'object' && !Buffer.isBuffer(v) && !v.error ? v : null;
	try { const v = ok(await $i.db.getValue(parent, 'prateem')); if (v) return v; } catch (_) {}
	try { const v = ok(await $i.db.get(`${parent}/prateem`)); if (v) return v; } catch (_) {}
	try { const v = ok(await $i.db.get(`${parent}/prateem`, { max: true })); if (v) return v; } catch (_) {}
	return null;
}

function isBlank(v) {
	if (v === null || v === undefined) return true;
	if (typeof v === 'string') return v.trim().length === 0;
	if (Array.isArray(v)) return v.length === 0;
	if (typeof v === 'object') return Object.keys(v).length === 0;
	return false;
}

/** Translation verdict for one full post record (shapes per needsWorkDetect). */
function translationOf(post) {
	if (Array.isArray(post.units) && post.units.length) {
		let missing = 0;
		for (const u of post.units) {
			if (!u || typeof u !== 'object') continue;
			if (isBlank(u.english !== undefined ? u.english : (u.en !== undefined ? u.en : u.translation))) missing++;
		}
		return {
			status: missing === 0 ? 'complete' : (missing < post.units.length ? 'partial' : 'missing'),
			needs: missing > 0, unitsMissing: missing, unitsTotal: post.units.length
		};
	}
	if (post.translation !== undefined && post.translation !== null) {
		const t = post.translation;
		const readable = typeof t === 'string' ? t : (t.readable !== undefined ? t.readable : t.english);
		if (isBlank(readable)) return { status: 'missing', needs: true };
		return { status: 'complete', needs: false };
	}
	const hebrew = post.hebrew || (post.source && post.source.hebrew);
	if (hebrew && isBlank(post.english)) return { status: 'missing', needs: true };
	if (!isBlank(post.english) || !isBlank(post.content) || !isBlank(post.text)) {
		return { status: 'complete', needs: false };
	}
	if (Array.isArray(post.phraseTranslations) && post.phraseTranslations.length) {
		return { status: 'complete', needs: false };
	}
	return { status: 'unknown', needs: false };
}

/** True when the post carries no English text in any known field. */
function isHebrewOnly(post, tr) {
	if (tr.status === 'complete') return false;
	if (Array.isArray(post.units) && post.units.length) {
		return !post.units.some(u => u && !isBlank(u.english !== undefined ? u.english : u.en));
	}
	if (!isBlank(post.english)) return false;
	if (Array.isArray(post.phraseTranslations) && post.phraseTranslations.length) return false;
	const t = post.translation;
	if (t && !isBlank(typeof t === 'string' ? t : t.readable)) return false;
	return true;
}

/** Phrase-translation gap, only where the post format carries them. */
function lacksPhrases(post) {
	if (post.phraseTranslations !== undefined) return isBlank(post.phraseTranslations);
	if (Array.isArray(post.units) && post.units.length) {
		const carries = post.units.some(u => u && (u.phrases !== undefined || u.phraseTranslations !== undefined));
		if (!carries) return false;
		return post.units.every(u => !u || (isBlank(u.phrases) && isBlank(u.phraseTranslations)));
	}
	return false;
}

function hasStudyGuide(post) {
	const sg = post.studyGuide;
	if (sg === null || sg === undefined) return false;
	if (typeof sg === 'string') return sg.trim().length > 0;
	if (Array.isArray(sg)) return sg.length > 0;
	if (typeof sg === 'object') {
		for (const v of Object.values(sg)) if (!isBlank(v)) return true;
		return false;
	}
	return !!sg;
}

function encodeCursor(offset) {
	return Buffer.from(JSON.stringify({ v: 1, o: offset }), 'utf8').toString('base64url');
}
function decodeCursor(raw) {
	if (!raw) return 0;
	try {
		const parsed = JSON.parse(Buffer.from(String(raw), 'base64url').toString('utf8'));
		const o = Number(parsed && parsed.o);
		return Number.isFinite(o) && o >= 0 ? Math.floor(o) : 0;
	} catch { return 0; }
}

module.exports = {

	/** GET /packed/census — see module header for the contract. */
	async census() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		// Multi-user scoping: operator-grade success (checkAuth) = admin
		// full-heichel view. A non-admin OAuth identity that checkAuth
		// rejects still gets a census — scoped to its own posts.
		const auth = this.checkAuth();
		let caller;
		if (!auth) {
			const b = tryBearer(this.$i);
			caller = { identity: (b && b.userId) || 'operator', isAdmin: true, via: b ? 'oauth' : 'operator' };
		} else {
			const b = tryBearer(this.$i);
			if (b && b.userId && b.userId !== 'asdf') {
				caller = { identity: b.userId, isAdmin: false, via: 'oauth' };
			} else {
				return auth;
			}
		}
		const scopeSet = caller.isAdmin ? null : await callerAliases(this.$i, caller.identity);
		try { const _h = (this.$i && this.$i.headers) || {}; console.log('[AGENT-OP] id=' + (_h['x-agent-identity'] || 'UNIDENTIFIED') + ' kind=' + (_h['x-agent-kind'] || 'UNKNOWN')); } catch (_) {}

		const heichel = String(requestValue(this.$i, 'heichel') || '').trim();
		if (!heichel) return { success: false, error: 'MISSING_HEICHEL', message: 'Query param "heichel" is required.' };
		const seriesFilter = String(requestValue(this.$i, 'series') || '').trim();
		const missingRaw = String(requestValue(this.$i, 'missing') || '').trim();
		const missing = ['translation', 'studyGuide', 'any', 'issues'].includes(missingRaw) ? missingRaw : '';
		const flagFilter = String(requestValue(this.$i, 'flag') || '').trim();
		// NB: the framework coerces numeric query values to numbers, so
		// ?summary=1 arrives as the number 1 — compare as strings.
		const summary = String(requestValue(this.$i, 'summary')) === '1' || String(requestValue(this.$i, 'summary')) === 'true'
			|| requestValue(this.$i, 'mode') === 'summary';
		// Admin diagnostic (?debugRead=<postId>&series=<sid>) runs below,
		// after $i is bound: it reports what every read step returns.
		let limit = parseInt(requestValue(this.$i, 'limit'), 10);
		if (!Number.isFinite(limit) || limit <= 0) limit = summary ? 500 : 200;
		limit = Math.min(limit, summary ? 2000 : 500);
		const startOffset = decodeCursor(requestValue(this.$i, 'cursor'));
		const $i = this.$i;
		const registry = loadRegistry();
		const orphans = loadOrphans();
		// Series-record probe (filtered-series calls only): one point read
		// per request feeds the series_missing_prateem /
		// undefined_description computed flags in project(). undefined =
		// not probed (no series filter); null = record absent.
		let seriesPrateem;
		if (seriesFilter) {
			try { seriesPrateem = await readSeriesPrateem($i, heichel, seriesFilter); } catch (_) { seriesPrateem = undefined; }
		}

		const debugPid = String(requestValue(this.$i, 'debugRead') || '').trim();
		if (debugPid) {
			const sid = seriesFilter;
			const parent = `/social/heichelos/${heichel}/series/${sid}/posts`;
			const shape = (v) => v === null || v === undefined ? 'null' : (Buffer.isBuffer(v) ? 'buffer' : Array.isArray(v) ? `array(${v.length})` : typeof v === 'object' ? `object keys=[${Object.keys(v).slice(0, 8).join(',')}]${v.error ? ' error=' + String((v.error && v.error.code) || v.error) : ''}` : typeof v);
			const out = { postId: debugPid, series: sid, summaryParamSeen: String(requestValue(this.$i, 'summary')) };
			try { const env = await findKeyReverseAsync({ $i, shard: 'core', key: `/posts/${heichel}/${debugPid}` }); out.coreExact = env ? `envelope value=${shape(env.value)}` : 'null'; } catch (e) { out.coreExact = 'THREW ' + String(e && e.message || e).slice(0, 120); }
			try { const env = await findKeySuffixReverseAsync({ $i, shard: 'core', postId: debugPid }); out.coreSuffix = env ? `envelope value=${shape(env.value)}` : 'null'; } catch (e) { out.coreSuffix = 'THREW ' + String(e && e.message || e).slice(0, 120); }
			try { out.getValue = shape(await $i.db.getValue(parent, debugPid)); } catch (e) { out.getValue = 'THREW ' + String(e && e.message || e).slice(0, 120); }
			try { out.getChild = shape(await $i.db.get(`${parent}/${debugPid}`, { max: true })); } catch (e) { out.getChild = 'THREW ' + String(e && e.message || e).slice(0, 120); }
			try { const ks = await $i.db.getObjectKeys(parent); out.parentKeyCount = Array.isArray(ks) ? ks.length : shape(ks); } catch (e) { out.parentKeyCount = 'THREW ' + String(e && e.message || e).slice(0, 120); }
			return { success: out };
		}

		// -- membership: packed grouped index (import system of record) ------
		const entry = getGroupedEntry($i, heichel);
		let candidates;
		if (seriesFilter) {
			const seen = new Set();
			candidates = [];
			for (const c of (entry.groups.get(seriesFilter) || [])) {
				const pid = String(c && c.postId || '');
				if (!pid || seen.has(pid)) continue;
				seen.add(pid);
				candidates.push({ ...c, _source: 'packed' });
			}
			// Union the native series keys for this one series (bounded: one
			// key listing), so native-only posts are enumerated too.
			// (Admin only: native candidates carry no owner until read, so a
			// scoped census stays on the packed index whose compacts do.)
			if (caller.isAdmin) try {
				const keys = await $i.db.getObjectKeys(`/social/heichelos/${heichel}/series/${seriesFilter}/posts`);
				if (Array.isArray(keys)) {
					for (const k of keys) {
						const pid = String(k || '');
						if (!pid || seen.has(pid)) continue;
						seen.add(pid);
						candidates.push({ postId: pid, heichelId: heichel, seriesId: seriesFilter, title: '', updatedAt: 0, _source: 'native' });
					}
				}
			} catch (_) { /* native store unavailable: packed-only census */ }
		} else {
			candidates = (entry.all || []).map(c => ({ ...c, _source: 'packed' }));
		}
		// Owner scoping for non-admin callers: packed compacts carry the
		// owner alias; a post-read recheck in projectSlice drops any record
		// whose live alias disagrees (stale compact protection).
		if (scopeSet) candidates = candidates.filter(c => scopeSet.has(String(c.aliasId || '')));
		candidates.sort((a, b) => String(a.postId) < String(b.postId) ? -1 : (String(a.postId) > String(b.postId) ? 1 : 0));
		const total = candidates.length;

		// -- per-post point read: packed core index, native child, suffix ---
		const readFull = async (cand) => {
			const pid = String(cand.postId);
			// Packed core first (exact key, then suffix via the same key
			// index — both O(index) reads). The native DosDB get is LAST:
			// on the multi-GB FS stores a native MISS costs seconds, so it
			// is only paid for genuinely native-only posts.
			try {
				const env = await findKeyReverseAsync({ $i, shard: 'core', key: `/posts/${heichel}/${pid}` });
				if (env && env.value && typeof env.value === 'object') return env.value;
			} catch (_) {}
			try {
				const env = await findKeySuffixReverseAsync({ $i, shard: 'core', postId: pid });
				if (env && env.value && typeof env.value === 'object') return env.value;
			} catch (_) {}
			try {
				const sid = cand.seriesId || seriesFilter;
				if (sid) {
					// Native read forms, in the public reader's proven order
					// (getPostFromSeries, post/indexRead.js), each guarded:
					// getValue can THROW a DosDB buffer-bounds error on some
					// FS-bridge records (observed live on igeres-he-*), and
					// its fallback is a get() whose opts are keyed by postId.
					const parent = `/social/heichelos/${heichel}/series/${sid}/posts`;
					const child = `${parent}/${pid}`;
					const ok = (v) => v && typeof v === 'object' && !Buffer.isBuffer(v) && !v.error ? v : null;
					let v = null;
					try { v = ok(await $i.db.getValue(parent, pid)); } catch (_) {}
					if (!v) { try { v = ok(await $i.db.get(child)); } catch (_) {} }
					if (!v) {
						try {
							const keyed = await $i.db.get(child, { [pid]: { max: true } });
							if (keyed && typeof keyed === 'object' && keyed[pid]) v = ok(keyed[pid]);
						} catch (_) {}
					}
					if (!v) { try { v = ok(await $i.db.get(child, { max: true })); } catch (_) {} }
					if (v) return v;
				}
			} catch (_) {}
			return null;
		};
		const project = (cand, post) => {
			const pid = String(cand.postId);
			const sid = String((post && (post.seriesId || post.parentSeriesId)) || cand.seriesId || '');
			const issues = new Set();
			let tr = { status: 'unreadable', needs: false };
			let guide = false;
			if (!post) {
				issues.add('unreadable');
			} else {
				tr = translationOf(post);
				guide = hasStudyGuide(post);
				if (tr.needs) issues.add('missing_english');
				if (isHebrewOnly(post, tr)) issues.add('hebrew_only');
				if (!guide) issues.add('missing_study_guide');
				if (lacksPhrases(post)) issues.add('missing_phrase_translations');
				// Meiri sequence-anchored units await verbatim line-up.
				if (Array.isArray(post.units) && post.units.some(u => u && u.anchorStatus === 'unanchored-sequence')) {
					issues.add('unanchored_sequence');
				}
				// Empty post: a readable record with no content in any
				// known field (registration stubs, placeholder shells).
				const dayuhSections = post.dayuh && Array.isArray(post.dayuh.sections) ? post.dayuh.sections.length : 0;
				if (!(Array.isArray(post.units) && post.units.length)
					&& !(Array.isArray(post.phraseTranslations) && post.phraseTranslations.length)
					&& !dayuhSections
					&& isBlank(post.content) && isBlank(post.text) && isBlank(post.english)
					&& isBlank(post.hebrew) && isBlank(post.source && post.source.hebrew)) {
					issues.add('empty_post');
				}
				// Stored translation_status vs measured content: the
				// field is known to lie, so a clear contradiction is
				// its own flag.
				const storedStatus = String(post.translation_status || '').toLowerCase();
				if (storedStatus) {
					const claimsEnglish = /bilingual|multilingual|complete|translated/.test(storedStatus);
					const claimsNone = /hebrew|none|untranslated|missing/.test(storedStatus);
					const hasEnglish = (Array.isArray(post.units) && post.units.some(u => u && !isBlank(u.english !== undefined ? u.english : u.en)))
						|| (Array.isArray(post.phraseTranslations) && post.phraseTranslations.some(x => x && !isBlank(x.en !== undefined ? x.en : x.english)))
						|| !isBlank(post.english)
						|| !!(post.translation && !isBlank(typeof post.translation === 'string' ? post.translation : post.translation.readable));
					if ((claimsEnglish && isHebrewOnly(post, tr)) || (claimsNone && hasEnglish)) {
						issues.add('translation_status_mismatch');
					}
				}
				// Series-record flags (filtered-series calls; the probe
				// ran once per request before the scan). Applies to every
				// record of the filtered census: membership in the
				// candidate set IS membership in that series (grouped
				// index key / native union), even when a post's stored
				// seriesId names a parent or sibling.
				if (seriesFilter && seriesPrateem !== undefined) {
					if (seriesPrateem === null) issues.add('series_missing_prateem');
					else if (String(seriesPrateem.description || '').trim() === 'undefined') issues.add('undefined_description');
				}
			}
			const flagDetails = {};
			const addRegistry = (entries) => {
				for (const e of entries || []) {
					if (typeof e === 'string') issues.add(e);
					else if (e && typeof e === 'object' && e.flag) {
						issues.add(String(e.flag));
						if (e.detail !== undefined) flagDetails[String(e.flag)] = e.detail;
					}
				}
			};
			addRegistry(registry.byPost.get(pid));
			addRegistry(registry.bySeries.get(`${heichel}/${sid}`));
			if (seriesFilter) addRegistry(registry.bySeries.get(`${heichel}/${seriesFilter}`));
			if (orphans.set.has(`${heichel}/${sid}`)) issues.add('not_discoverable');
			else if (seriesFilter && orphans.set.has(`${heichel}/${seriesFilter}`)) issues.add('not_discoverable');
			const rec = {
				postId: pid,
				seriesId: sid,
				title: (post && (post.title || post.name)) || cand.title || '',
				aliasId: (post && (post.aliasId || post.author)) || cand.aliasId || '',
				translation_status: tr.status,
				needsTranslation: !!tr.needs,
				hasStudyGuide: guide,
				issues: [...issues],
				...(Object.keys(flagDetails).length ? { flagDetails } : {}),
				updatedAt: (post && (post.updatedAt || post.createdAt || post.timestamp)) || cand.updatedAt || 0,
				source: cand._source || 'packed'
			};
			if (tr.unitsTotal !== undefined) { rec.unitsMissing = tr.unitsMissing; rec.unitsTotal = tr.unitsTotal; }
			return rec;
		};
		const matches = (rec) => {
			if (flagFilter) return rec.issues.includes(flagFilter);
			if (!missing) return true;
			if (missing === 'translation') return rec.needsTranslation;
			if (missing === 'studyGuide') return !rec.hasStudyGuide;
			if (missing === 'issues') return rec.issues.length > 0;
			return rec.needsTranslation || !rec.hasStudyGuide; // any
		};
		// Bounded-concurrency projection over a slice of candidates.
		const projectSlice = async (slice) => {
			const out = new Array(slice.length);
			let cur = 0;
			const worker = async () => {
				while (cur < slice.length) {
					const idx = cur++;
					out[idx] = project(slice[idx], await readFull(slice[idx]));
				}
			};
			await Promise.all(Array.from({ length: Math.min(READ_CONCURRENCY, slice.length || 1) }, worker));
			if (scopeSet) return out.filter(r => r && scopeSet.has(String(r.aliasId || '')));
			return out;
		};

		const scanStart = Date.now();
		let offset = Math.min(startOffset, total);
		const done = () => offset >= total;

		if (summary) {
			const perSeries = {};
			const issueCounts = {};
			let scanned = 0, needsT = 0, missG = 0, unreadable = 0, withIssues = 0;
			while (!done() && scanned < limit && (Date.now() - scanStart) < SCAN_BUDGET_MS) {
				const chunkSize = Math.min(100, limit - scanned, total - offset);
				const recs = await projectSlice(candidates.slice(offset, offset + chunkSize));
				offset += recs.length; scanned += recs.length;
				for (const r of recs) {
					const bucket = perSeries[r.seriesId] || (perSeries[r.seriesId] = { total: 0, needsTranslation: 0, missingStudyGuide: 0, withIssues: 0, issues: {} });
					bucket.total++;
					if (r.needsTranslation) { bucket.needsTranslation++; needsT++; }
					if (!r.hasStudyGuide) { bucket.missingStudyGuide++; missG++; }
					if (r.translation_status === 'unreadable') unreadable++;
					if (r.issues.length) { bucket.withIssues++; withIssues++; }
					for (const f of r.issues) {
						bucket.issues[f] = (bucket.issues[f] || 0) + 1;
						issueCounts[f] = (issueCounts[f] || 0) + 1;
					}
				}
			}
			return { success: {
				mode: 'summary', heichel, series: seriesFilter || null,
				scope: caller.isAdmin ? 'admin' : 'owner', caller: caller.identity,
				totalCandidates: total, scanned, partial: !done(),
				needsTranslation: needsT, missingStudyGuide: missG, unreadable,
				withIssues, issueCounts, knownQuirks: KNOWN_QUIRKS,
				nextCursor: done() ? null : encodeCursor(offset),
				perSeries
			} };
		}

		if (!missing && !flagFilter) {
			// Chunked under the same scan budget: a page of slow native-miss
			// reads returns partial progress + cursor instead of hanging.
			const posts = [];
			while (!done() && posts.length < limit && (Date.now() - scanStart) < SCAN_BUDGET_MS) {
				const chunkSize = Math.min(25, limit - posts.length, total - offset);
				const recs = await projectSlice(candidates.slice(offset, offset + chunkSize));
				offset += recs.length;
				posts.push(...recs);
			}
			return { success: {
				mode: 'list', heichel, series: seriesFilter || null,
				scope: caller.isAdmin ? 'admin' : 'owner', caller: caller.identity,
				count: posts.length, total, scanned: posts.length, partial: !done(), knownQuirks: KNOWN_QUIRKS,
				nextCursor: done() ? null : encodeCursor(offset),
				posts
			} };
		}

		// Filtered list: scan from the cursor until the page fills. The
		// next cursor points just past the last RETURNED match, so a chunk
		// that overflows the page is re-scanned from there next call —
		// no match is ever skipped or double-returned.
		const posts = [];
		let scanned = 0;
		while (!done() && posts.length < limit && scanned < SCAN_BUDGET_MAX && (Date.now() - scanStart) < SCAN_BUDGET_MS) {
			const chunkBase = offset;
			const chunkSize = Math.min(100, total - offset);
			const recs = await projectSlice(candidates.slice(offset, offset + chunkSize));
			offset += recs.length; scanned += recs.length;
			for (let j = 0; j < recs.length; j++) {
				if (!matches(recs[j])) continue;
				if (posts.length >= limit) { offset = chunkBase + j; break; }
				posts.push(recs[j]);
				if (posts.length >= limit) { offset = chunkBase + j + 1; break; }
			}
		}
		return { success: {
			mode: 'list', heichel, series: seriesFilter || null, missing, flag: flagFilter || null,
			scope: caller.isAdmin ? 'admin' : 'owner', caller: caller.identity,
			count: posts.length, total, scanned, partial: !done(), knownQuirks: KNOWN_QUIRKS,
			nextCursor: done() ? null : encodeCursor(offset),
			posts
		} };
	}
};
