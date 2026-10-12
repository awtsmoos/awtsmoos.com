// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NeedsWorkRoutes
 * @description
 * B"H — "What needs work on my posts?" for tunnel-connected AI agents.
 *
 * GET /api/social/posts/needsWork
 *   Full report for the authenticated account: every owned alias, organized
 *   alias -> heichel/series -> post, with gap counts and priorities.
 * GET /api/social/aliases/:alias/postsMade/needsWork
 *   Same report scoped to one alias (must belong to the requester).
 *
 * Gap types covered:
 *   missing_translation, missing_phrase_translations, missing_summaries,
 *   missing_footnotes, missing_page_markers, broken_page_markers,
 *   no_alias_link, empty_alias_link, submitted_unapproved.
 *
 * Reads AwtsmoosDB natively on production ($i.db). Never touches the repo.
 * Hebrew bytes are only read, never written or normalized.
 *
 * Query params:
 *   limit (default 400, max 2000) — max post records scanned per alias
 *   heichel — restrict to one heichel id
 *   series — restrict to one series id
 *   gaps — comma list to include (default: all)
 *   summaryOnly — 1 to skip per-post items, keep counts only
 */

const { sp, NO_LOGIN } = require("../../_awtsmoos.constants.js");
const { loggedIn, er, myOpts } = require("../../general.js");

const GAP_PRIORITY = {
	missing_translation: 1,
	missing_footnotes: 1,
	broken_page_markers: 2,
	missing_phrase_translations: 2,
	missing_page_markers: 2,
	no_alias_link: 2,
	empty_alias_link: 2,
	submitted_unapproved: 2,
	missing_summaries: 3
};

const GAP_LABEL = {
	missing_translation: "Missing English translation",
	missing_phrase_translations: "Missing phrase-by-phrase translations",
	missing_summaries: "Missing summaries",
	missing_footnotes: "Missing footnotes",
	missing_page_markers: "No inline page markers (series uses them)",
	broken_page_markers: "Broken/malformed inline page markers",
	no_alias_link: "Post has no author alias link",
	empty_alias_link: "Alias has no linked posts at all",
	submitted_unapproved: "Submitted, awaiting approval"
};

function isBlank(value) {
	if (value === undefined || value === null) return true;
	if (typeof value === "string") return !value.trim();
	if (Array.isArray(value)) return value.length === 0;
	if (typeof value === "object") return Object.keys(value).length === 0;
	return false;
}

function queryInt(value, fallback, min, max) {
	const n = parseInt(value, 10);
	if (Number.isNaN(n)) return fallback;
	return Math.max(min, Math.min(max, n));
}

/** Best-effort native read; null on any failure (never throws the scan). */
async function safeGet($i, path, opts) {
	try {
		return await $i.db.get(path, opts || { max: true });
	} catch {
		return null;
	}
}

async function safeGetValue($i, path, key) {
	try {
		return await $i.db.getValue(path, key);
	} catch {
		return null;
	}
}

async function safeKeys($i, path) {
	try {
		const keys = await $i.db.getObjectKeys(path);
		return Array.isArray(keys) ? keys : [];
	} catch {
		return [];
	}
}

/** Alias ids owned by the authenticated user. */
async function userAliasIds($i, userID) {
	try {
		const list = await $i.db.get(`/users/${userID}/aliases/`, myOpts($i));
		return Array.isArray(list) ? list.filter(Boolean) : [];
	} catch {
		return [];
	}
}

async function aliasInfo($i, aliasId) {
	const info = await safeGet($i, `${sp}/aliases/${aliasId}/info`);
	return {
		aliasId,
		name: (info && info.name) || aliasId,
		user: (info && info.user) || null
	};
}

/** Heichel ids present in the alias's postsSubmitted index. */
async function aliasHeichels($i, aliasId) {
	return safeKeys($i, `${sp}/aliases/${aliasId}/postsSubmitted/inHeichel`);
}

/** Series ids (last crumb of each chain) for one alias+heichel. */
async function aliasSeriesIds($i, aliasId, heichelId) {
	const base = `${sp}/aliases/${aliasId}/postsSubmitted/inHeichel/${heichelId}/seriesChain`;
	const series = new Set();
	async function walk(path) {
		const keys = await safeKeys($i, path);
		for (const key of keys) {
			const child = `${path}/${key}`;
			const grandchildren = await safeKeys($i, child);
			if (grandchildren.length) {
				await walk(child);
			} else {
				series.add(key);
			}
		}
	}
	await walk(base);
	// Fallback: if the tree walk found nothing, treat top-level keys as series ids.
	if (!series.size) {
		for (const key of await safeKeys($i, base)) series.add(key);
	}
	return [...series];
}

/** Collect searchable text from a post record (capped, read-only). */
function collectText(post, cap = 200000) {
	const parts = [];
	function push(value) {
		if (typeof value !== "string" || !value) return;
		if (parts.join("\n").length > cap) return;
		parts.push(value.slice(0, cap));
	}
	if (post && typeof post === "object") {
		if (post.source && Array.isArray(post.source.sections)) {
			for (const section of post.source.sections) push(section && section.originalText);
		}
		if (Array.isArray(post.units)) {
			for (const unit of post.units) {
				push(unit && unit.hebrew);
				push(unit && unit.english);
			}
		}
		const readable = post.translation && post.translation.readable;
		if (typeof readable === "string") push(readable);
		else if (readable && typeof readable === "object") {
			for (const value of Object.values(readable)) push(value);
		}
	}
	return parts.join("\n").slice(0, cap);
}

function countPageMarkers(text) {
	const valid = text.match(/\[p\.\s*\d+\s*\]/g) || [];
	const candidates = text.match(/\[p\.[^\]]*\]/g) || [];
	return { valid: valid.length, broken: Math.max(0, candidates.length - valid.length) };
}

/**
 * Detects gaps for one post record. Series conventions (computed from the
 * already-scanned siblings) decide whether absent footnotes/page markers
 * are genuine gaps or simply not that series' convention.
 */
function detectPostGaps(post, conventions) {
	const gaps = [];
	const detail = {};

	// --- translations ---
	if (Array.isArray(post.units)) {
		let missing = 0;
		let noPhrases = 0;
		for (const unit of post.units) {
			if (!unit) continue;
			if (isBlank(unit.english)) missing++;
			if (!Array.isArray(unit.phrases) || unit.phrases.length === 0) noPhrases++;
		}
		if (missing > 0) {
			gaps.push("missing_translation");
			detail.missing_translation = { unitsMissing: missing, unitsTotal: post.units.length };
		}
		if (noPhrases > 0) {
			gaps.push("missing_phrase_translations");
			detail.missing_phrase_translations = { unitsMissing: noPhrases, unitsTotal: post.units.length };
		}
	} else if (post.translation !== undefined) {
		const readable = post.translation && post.translation.readable;
		if (isBlank(readable)) {
			gaps.push("missing_translation");
			detail.missing_translation = { note: "translation.readable is empty" };
		}
		if (post.phraseTranslations !== undefined && isBlank(post.phraseTranslations)) {
			gaps.push("missing_phrase_translations");
			detail.missing_phrase_translations = { note: "phraseTranslations is empty" };
		}
	} else if (post.hebrew && !post.english) {
		gaps.push("missing_translation");
		detail.missing_translation = { note: "hebrew-only record" };
	}

	// --- summaries ---
	if (post.summaries !== undefined && isBlank(post.summaries)) {
		gaps.push("missing_summaries");
	}

	// --- footnotes (data-driven: only a gap when the series uses them) ---
	const hasFootnotes = post.footnotes !== undefined && !isBlank(post.footnotes);
	if (post.footnotes !== undefined && isBlank(post.footnotes) && conventions.footnoteShare >= 0.5) {
		gaps.push("missing_footnotes");
		detail.missing_footnotes = { note: "footnotes field empty; series convention includes footnotes" };
	} else if (post.footnotes === undefined && conventions.footnoteShare >= 0.5 && conventions.footnoteFieldSeen) {
		gaps.push("missing_footnotes");
		detail.missing_footnotes = { note: "no footnotes field; series convention includes footnotes" };
	}

	// --- inline page markers ---
	const text = collectText(post);
	const markers = countPageMarkers(text);
	if (markers.broken > 0) {
		gaps.push("broken_page_markers");
		detail.broken_page_markers = { broken: markers.broken };
	}
	if (markers.valid === 0 && conventions.pageMarkerShare >= 0.5) {
		gaps.push("missing_page_markers");
		detail.missing_page_markers = { note: "no [p. N] markers; series convention uses them" };
	}

	// --- alias link ---
	if (isBlank(post.author)) {
		gaps.push("no_alias_link");
	}

	return { gaps, detail, markerCount: markers.valid, hasFootnotes };
}

/** Scans one alias. Returns the organized alias -> series -> post report. */
async function scanAlias($i, aliasId, options) {
	const info = await aliasInfo($i, aliasId);
	const include = options.include; // Set of gap names, or null for all
	const limit = options.limit;
	const summaryOnly = options.summaryOnly;

	const report = {
		aliasId,
		aliasName: info.name,
		postCount: 0,
		scannedCount: 0,
		truncated: false,
		gapCounts: {},
		series: {}
	};

	let heichels = await aliasHeichels($i, aliasId);
	if (options.heichel) heichels = heichels.filter(h => h === options.heichel);
	if (!heichels.length) {
		report.gapCounts.empty_alias_link = 1;
		report.emptyAliasLink = true;
		return report;
	}

	const bump = gap => { report.gapCounts[gap] = (report.gapCounts[gap] || 0) + 1; };
	const wanted = gap => !include || include.has(gap);

	for (const heichelId of heichels) {
		let seriesIds = await aliasSeriesIds($i, aliasId, heichelId);
		if (options.series) seriesIds = seriesIds.filter(s => s === options.series);
		for (const seriesId of seriesIds) {
			const postsPath = `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`;
			const postIds = await safeKeys($i, postsPath);
			if (!postIds.length) continue;
			const seriesKey = `${heichelId}/${seriesId}`;
			const seriesReport = { heichelId, seriesId, postCount: postIds.length, items: [] };

			// Two passes: first collect raw detections, then apply series conventions.
			const raws = [];
			for (const postId of postIds) {
				if (report.scannedCount >= limit) { report.truncated = true; break; }
				const post = await safeGetValue($i, postsPath, postId);
				report.scannedCount++;
				if (!post || typeof post !== "object") continue;
				if (post.author && post.author !== aliasId) continue; // another alias's post
				report.postCount++;
				const first = detectPostGaps(post, { footnoteShare: 0, pageMarkerShare: 0, footnoteFieldSeen: false });
				raws.push({
					postId,
					title: post.title || postId,
					post,
					markerCount: first.markerCount,
					hasFootnotes: first.hasFootnotes,
					footnoteFieldSeen: post.footnotes !== undefined
				});
			}
			if (report.truncated) break;

			const withMarkers = raws.filter(r => r.markerCount > 0).length;
			const withFootnotes = raws.filter(r => r.hasFootnotes).length;
			const footnoteFieldSeen = raws.some(r => r.footnoteFieldSeen);
			const conventions = {
				pageMarkerShare: raws.length ? withMarkers / raws.length : 0,
				footnoteShare: raws.length ? withFootnotes / raws.length : 0,
				footnoteFieldSeen
			};

			for (const raw of raws) {
				const detected = detectPostGaps(raw.post, conventions);
				const gaps = detected.gaps.filter(wanted);
				for (const gap of gaps) bump(gap);
				if (gaps.length && !summaryOnly) {
					seriesReport.items.push({
						postId: raw.postId,
						title: raw.title,
						heichelId,
						seriesId,
						gaps,
						priority: Math.min(...gaps.map(g => GAP_PRIORITY[g] || 3)),
						detail: detected.detail
					});
				} else if (gaps.length && summaryOnly) {
					seriesReport.items.push({ postId: raw.postId, title: raw.title, gaps });
				}
			}
			seriesReport.items.sort((a, b) => (a.priority || 3) - (b.priority || 3));
			if (Object.keys(seriesReport.items).length || report.postCount) report.series[seriesKey] = seriesReport;
		}
		if (report.truncated) break;
	}
	return report;
}

/** Submitted-but-unapproved posts per heichel (the production "ready but unimported" queue). */
async function submittedUnapproved($i, heichelIds, wanted) {
	const out = [];
	if (wanted && !wanted.has("submitted_unapproved")) return out;
	let listLegacyPosts = null;
	try {
		listLegacyPosts = require("../post/submissions.js").getSubmittedPosts;
	} catch {
		return out;
	}
	for (const heichelId of heichelIds) {
		try {
			const queued = await listLegacyPosts({ $i, heichelId });
			const items = Array.isArray(queued) ? queued : (queued && queued.success) || [];
			for (const item of [].concat(items)) {
				if (item && typeof item === "object") {
					out.push({
						heichelId,
						postId: item.postId || item.id || null,
						title: item.title || item.postId || "untitled",
						gaps: ["submitted_unapproved"],
						priority: GAP_PRIORITY.submitted_unapproved
					});
				}
			}
		} catch {
			/* one bad heichel queue never sinks the report */
		}
	}
	return out;
}

function parseOptions($i) {
	const query = ($i && $i.$_GET) || {};
	const include = query.gaps
		? new Set(String(query.gaps).split(",").map(s => s.trim()).filter(Boolean))
		: null;
	return {
		limit: queryInt(query.limit, 400, 1, 2000),
		heichel: query.heichel ? String(query.heichel) : null,
		series: query.series ? String(query.series) : null,
		include,
		summaryOnly: String(query.summaryOnly || "") === "1"
	};
}

async function buildAccountReport($i, userid, options, onlyAliasId = null) {
	let aliasIds = await userAliasIds($i, userid);
	if (onlyAliasId) {
		if (!aliasIds.includes(onlyAliasId)) {
			return er({ code: "ALIAS_NOT_OWNED", message: "That alias does not belong to this account." });
		}
		aliasIds = [onlyAliasId];
	}

	const byAlias = {};
	const totals = { aliases: aliasIds.length, posts: 0, postsWithGaps: 0, byGap: {} };
	const topWork = [];
	const touchedHeichels = new Set();

	for (const aliasId of aliasIds) {
		const scanned = await scanAlias($i, aliasId, options);
		byAlias[aliasId] = scanned;
		totals.posts += scanned.postCount;
		for (const [gap, count] of Object.entries(scanned.gapCounts)) {
			totals.byGap[gap] = (totals.byGap[gap] || 0) + count;
		}
		for (const seriesReport of Object.values(scanned.series)) {
			touchedHeichels.add(seriesReport.heichelId);
			for (const item of seriesReport.items) {
				totals.postsWithGaps++;
				if (topWork.length < 200) {
					topWork.push({
						aliasId,
						aliasName: scanned.aliasName,
						heichelId: item.heichelId,
						seriesId: item.seriesId,
						postId: item.postId,
						title: item.title,
						gaps: item.gaps,
						gapLabels: item.gaps.map(g => GAP_LABEL[g] || g),
						priority: item.priority || 3
					});
				}
			}
		}
	}

	topWork.sort((a, b) => (a.priority - b.priority) || a.aliasName.localeCompare(b.aliasName));

	const queued = await submittedUnapproved($i, [...touchedHeichels], options.include);
	if (queued.length) {
		totals.byGap.submitted_unapproved = (totals.byGap.submitted_unapproved || 0) + queued.length;
		for (const item of queued) {
			if (topWork.length < 200) {
				topWork.push({
					aliasId: null,
					aliasName: null,
					heichelId: item.heichelId,
					seriesId: null,
					postId: item.postId,
					title: item.title,
					gaps: item.gaps,
					gapLabels: item.gaps.map(g => GAP_LABEL[g] || g),
					priority: item.priority
				});
			}
		}
		topWork.sort((a, b) => a.priority - b.priority);
	}

	const emptyAliases = Object.values(byAlias)
		.filter(a => a.emptyAliasLink)
		.map(a => ({ aliasId: a.aliasId, aliasName: a.aliasName }));

	return {
		ok: true,
		action: "posts.needsWork",
		scannedAt: new Date().toISOString(),
		account: { aliasCount: aliasIds.length },
		totals,
		byAlias,
		emptyAliases,
		submittedUnapproved: options.summaryOnly ? queued.length : queued,
		topWork: topWork.slice(0, 100),
		gapLabels: GAP_LABEL
	};
}

function createNeedsWorkRoutes({ $i, userid }) {
	return {
		"/posts/needsWork": async () => {
			if (!loggedIn($i)) return er(NO_LOGIN);
			if ($i.request.method !== "GET") {
				return er({ code: "METHOD_NOT_ALLOWED", message: "Use GET." });
			}
			return buildAccountReport($i, userid, parseOptions($i));
		},
		"/aliases/:alias/postsMade/needsWork": async vars => {
			if (!loggedIn($i)) return er(NO_LOGIN);
			if ($i.request.method !== "GET") {
				return er({ code: "METHOD_NOT_ALLOWED", message: "Use GET." });
			}
			return buildAccountReport($i, userid, parseOptions($i), vars.alias);
		}
	};
}

module.exports = {
	createNeedsWorkRoutes,
	// Exported for unit tests.
	detectPostGaps,
	collectText,
	countPageMarkers,
	GAP_PRIORITY,
	GAP_LABEL
};
