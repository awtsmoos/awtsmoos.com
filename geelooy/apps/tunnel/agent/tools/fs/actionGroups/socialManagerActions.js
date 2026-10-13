// B"H
// Boruch Hashem
// Blessed is He

const { httpJson } = require("../httpClient.js");

/**
 * B"H — Autonomous social manager for tunnel-connected AI agents.
 *
 * Yaakov (2026-10-11): the tunnel's Virtual OS agent must AUTOMATICALLY MANAGE
 * all of the user's aliases, heichelos posts, comments, and more — not just
 * open the OS.
 *
 * This action group gives one agent the whole social surface through plain
 * authenticated HTTPS calls to production (native AwtsmoosDB, server-side).
 * Nothing is read from the repo; Hebrew bytes are never written.
 *
 * Actions:
 *   socialManagerRun    — the autonomous loop: aliases -> posts -> comments,
 *                         one unified report of managed vs queued items.
 *   socialAliases       — list all owned aliases + profile health.
 *   socialPostsNeedsWork— post-gap report (delegates to postsNeedsWork).
 *   socialCommentsQueue — moderation queue across heichels, with spam/empty triage.
 *   socialCommentApprove— approve a queued comment (POST).
 *   socialCommentDeny   — deny a queued comment (POST).
 *
 * Auth resolution (same as postsActions):
 *   payload.headers, payload.cookie, payload.apiKey (X-Awtsmoos-Api-Key),
 *   named cookie jar (payload.cookieJarName || "awtsmoos"),
 *   AWTSMOOS_SESSION_COOKIE env.
 */

function baseUrl(payload = {}) {
	return String(
		payload.baseUrl || payload.origin || process.env.AWTSMOOS_BASE_URL || "https://awtsmoos.com"
	).replace(/\/$/, "");
}

function authHeaders(payload = {}) {
	const headers = { ...(payload.headers || {}) };
	if (payload.cookie && !headers.Cookie && !headers.cookie) {
		headers.Cookie = String(payload.cookie);
	}
	if (payload.apiKey && !headers["X-Awtsmoos-Api-Key"]) {
		headers["X-Awtsmoos-Api-Key"] = String(payload.apiKey);
	}
	const envCookie = process.env.AWTSMOOS_SESSION_COOKIE;
	if (envCookie && !headers.Cookie && !headers.cookie) {
		headers.Cookie = envCookie;
	}
	return headers;
}

function noLoginGuidance() {
	return "The agent is not authenticated to awtsmoos.com. " +
		"Log in first (awt login), or pass the session via the cookie, headers, apiKey, " +
		"cookieJarName, or AWTSMOOS_SESSION_COOKIE.";
}

function buildSocialManagerActions({ config, payload }) {
	const p = payload || {};
	const base = baseUrl(p);
	const headers = authHeaders(p);
	const jar = p.cookieJarName || p.jar || "awtsmoos";
	const timeoutMs = Math.max(5000, Math.min(Number(p.timeoutMs || 120000), 240000));

	async function api(method, path, body) {
		const url = `${base}/api/social${path}`;
		const response = await httpJson(config, {
			url,
			method,
			headers: body
				? { ...headers, "Content-Type": "application/json" }
				: headers,
			...(body ? { body: JSON.stringify(body) } : {}),
			cookieJarName: jar,
			timeoutMs,
			maxBytes: 20 * 1024 * 1024
		});
		if (!response.jsonValid) {
			return {
				ok: false,
				error: "bad_response",
				detail: `Non-JSON response from ${url} (HTTP ${response.statusCode}).`,
				statusCode: response.statusCode
			};
		}
		const json = response.json || {};
		if (json.error === "!!!!You're not logged in!!!!!!!" || json.code === "NO_LOGIN" || json.error === "NO_LOGIN") {
			return { ok: false, error: "not_logged_in", detail: noLoginGuidance() };
		}
		return { ok: true, data: json };
	}

	/** GET /posts/needsWork — alias inventory + gap counts (summary mode). */
	async function needsWorkSummary() {
		const r = await api("GET", "/posts/needsWork?summaryOnly=1&limit=2000");
		if (!r.ok) return r;
		return { ok: true, data: r.data };
	}

	/** Collect heichel ids touched by the account's aliases. */
	function heichelsFromReport(report) {
		const set = new Set();
		const byAlias = (report && report.byAlias) || {};
		for (const alias of Object.values(byAlias)) {
			for (const seriesReport of Object.values(alias.series || {})) {
				if (seriesReport.heichelId) set.add(seriesReport.heichelId);
			}
		}
		return [...set];
	}

	/** Triage one comment: spam / empty / needs-review. */
	function triageComment(comment) {
		const text = String((comment && (comment.text || comment.body || comment.content)) || "");
		const trimmed = text.trim();
		if (!trimmed) return { verdict: "empty", reason: "no text content" };
		// Obvious spam signals.
		const links = (trimmed.match(/https?:\/\//g) || []).length;
		if (links >= 3) return { verdict: "spam", reason: `${links} links` };
		if (/(viagra|cialis|crypto giveaway|double your|free money|click here)/i.test(trimmed)) {
			return { verdict: "spam", reason: "spam keyword match" };
		}
		if (trimmed.length > 5000) return { verdict: "needs_review", reason: "very long comment" };
		return { verdict: "clean", reason: "no spam signals" };
	}

	return {
		/**
		 * List all owned aliases + profile health.
		 * Empty aliases (no posts at all) are flagged for the user.
		 */
		socialAliases: async () => {
			const r = await needsWorkSummary();
			if (!r.ok) return { ok: false, action: "socialAliases", ...r };
			const report = r.data;
			const byAlias = report.byAlias || {};
			const aliases = Object.values(byAlias).map(a => ({
				aliasId: a.aliasId,
				aliasName: a.aliasName,
				postCount: a.postCount,
				empty: !!a.emptyAliasLink,
				gapCounts: a.gapCounts || {}
			}));
			return {
				ok: true,
				action: "socialAliases",
				aliasCount: aliases.length,
				aliases,
				emptyAliases: report.emptyAliases || [],
				managed: `${aliases.length} aliases inventoried`,
				needsAttention: (report.emptyAliases || []).length
					? "Some aliases have no posts at all — see emptyAliases."
					: null
			};
		},

		/**
		 * Post-gap report across the account (delegates to the needsWork detector).
		 * Optional payload: alias, heichel, series, gaps (csv), limit.
		 */
		socialPostsNeedsWork: async () => {
			const alias = p.alias || p.aliasId;
			const params = new URLSearchParams();
			if (p.limit) params.set("limit", String(p.limit));
			if (p.heichel) params.set("heichel", String(p.heichel));
			if (p.series) params.set("series", String(p.series));
			if (p.gaps) params.set("gaps", String(p.gaps));
			const q = params.toString();
			const path = alias
				? `/aliases/${encodeURIComponent(alias)}/postsMade/needsWork${q ? "?" + q : ""}`
				: `/posts/needsWork${q ? "?" + q : ""}`;
			const r = await api("GET", path);
			if (!r.ok) return { ok: false, action: "socialPostsNeedsWork", ...r };
			return { ok: true, action: "socialPostsNeedsWork", ...r.data };
		},

		/**
		 * Comment moderation queue across heichels, with automatic triage.
		 * Optional payload.heichel to scope to one heichel.
		 * Returns: clean (no action needed), empty (auto-deny candidates),
		 * spam (flagged for review), needs_review (needs the user's eyes).
		 */
		socialCommentsQueue: async () => {
			const heichels = p.heichel
				? [String(p.heichel)]
				: heichelsFromReport((await needsWorkSummary()).data);
			const queue = [];
			const errors = [];
			for (const heichelId of heichels) {
				const r = await api("GET", `/heichelos/${encodeURIComponent(heichelId)}/submittedComments`);
				if (!r.ok) {
					errors.push({ heichelId, error: r.error, detail: r.detail });
					continue;
				}
				const items = Array.isArray(r.data)
					? r.data
					: (r.data && (r.data.success || r.data.comments || r.data.items)) || [];
				for (const item of [].concat(items)) {
					if (!item || typeof item !== "object") continue;
					const triage = triageComment(item);
					queue.push({
						heichelId,
						commentId: item.commentId || item.id || null,
						aliasId: item.aliasId || item.alias || null,
						author: item.author || item.aliasId || null,
						text: String(item.text || item.body || item.content || "").slice(0, 500),
						triage: triage.verdict,
						triageReason: triage.reason
					});
				}
			}
			const byTriage = { clean: 0, empty: 0, spam: 0, needs_review: 0 };
			for (const q of queue) byTriage[q.triage] = (byTriage[q.triage] || 0) + 1;
			return {
				ok: true,
				action: "socialCommentsQueue",
				heichelsChecked: heichels,
				queuedCount: queue.length,
				byTriage,
				queue,
				errors: errors.length ? errors : undefined,
				managed: `${queue.length} queued comments triaged`,
				needsAttention: (byTriage.spam + byTriage.needs_review) > 0
					? `${byTriage.spam} spam + ${byTriage.needs_review} need review`
					: null
			};
		},

		/**
		 * Approve a queued comment. Payload: heichel, commentId, aliasId.
		 */
		socialCommentApprove: async () => {
			const heichel = p.heichel, commentId = p.commentId, aliasId = p.aliasId;
			if (!heichel || !commentId || !aliasId) {
				return { ok: false, action: "socialCommentApprove", error: "missing_args", detail: "Need heichel, commentId, aliasId." };
			}
			const r = await api("POST", `/heichelos/${encodeURIComponent(heichel)}/submittedComments/approve`, { commentId, aliasId });
			if (!r.ok) return { ok: false, action: "socialCommentApprove", ...r };
			return { ok: true, action: "socialCommentApprove", result: r.data };
		},

		/**
		 * Deny a queued comment. Payload: heichel, commentId, aliasId.
		 */
		socialCommentDeny: async () => {
			const heichel = p.heichel, commentId = p.commentId, aliasId = p.aliasId;
			if (!heichel || !commentId || !aliasId) {
				return { ok: false, action: "socialCommentDeny", error: "missing_args", detail: "Need heichel, commentId, aliasId." };
			}
			const r = await api("POST", `/heichelos/${encodeURIComponent(heichel)}/submittedComments/deny`, { commentId, aliasId });
			if (!r.ok) return { ok: false, action: "socialCommentDeny", ...r };
			return { ok: true, action: "socialCommentDeny", result: r.data };
		},

		/**
		 * THE AUTONOMOUS LOOP. One call manages the whole social surface:
		 *   1. Aliases: inventory + profile health.
		 *   2. Posts: gap scan (missing translations/summaries/footnotes/page markers/alias links).
		 *   3. Comments: moderation queue with spam/empty triage.
		 *
		 * What the loop MANAGES automatically:
		 *   - alias inventory + empty-alias detection
		 *   - post-gap detection + prioritized work queue (P1/P2/P3)
		 *   - comment triage (spam/empty/clean/needs_review)
		 * What it QUEUES (never auto-does):
		 *   - filling translations/summaries/footnotes (needs a translation agent or human)
		 *   - approve/deny decisions (needs the user's eyes; empty comments are deny candidates)
		 *   - creating aliases (needs the user's call)
		 */
		socialManagerRun: async () => {
			const managed = [];
			const queued = [];
			const attention = [];

			// --- 1. Aliases ---
			const nw = await needsWorkSummary();
			if (!nw.ok) {
				return { ok: false, action: "socialManagerRun", error: nw.error, detail: nw.detail };
			}
			const report = nw.data;
			const byAlias = report.byAlias || {};
			const aliasIds = Object.keys(byAlias);
			managed.push(`${aliasIds.length} aliases inventoried`);
			const emptyAliases = report.emptyAliases || [];
			if (emptyAliases.length) {
				attention.push(`${emptyAliases.length} aliases have no posts at all`);
				queued.push({ kind: "empty_aliases", items: emptyAliases, action: "user: assign posts or retire alias" });
			}

			// --- 2. Posts ---
			const totals = report.totals || {};
			const byGap = totals.byGap || {};
			const gapNames = Object.keys(byGap);
			if (gapNames.length) {
				managed.push(`${totals.postsWithGaps || 0} posts with gaps detected across ${totals.posts || 0} posts`);
				const topWork = (report.topWork || []).slice(0, 50).map(w => ({
					aliasId: w.aliasId,
					heichelId: w.heichelId,
					seriesId: w.seriesId,
					postId: w.postId,
					title: w.title,
					gaps: w.gaps,
					priority: w.priority
				}));
				queued.push({ kind: "post_gaps", byGap, count: gapNames.reduce((n, g) => n + (byGap[g] || 0), 0), topWork, action: "translation agent or human fills gaps in priority order" });
				if ((byGap.missing_translation || 0) > 0) {
					attention.push(`${byGap.missing_translation} posts missing translations`);
				}
			} else {
				managed.push("posts: no gaps detected");
			}
			const submitted = report.submittedUnapproved;
			const submittedCount = Array.isArray(submitted) ? submitted.length : (submitted || 0);
			if (submittedCount > 0) {
				attention.push(`${submittedCount} posts submitted, awaiting approval`);
				queued.push({ kind: "submitted_unapproved", count: submittedCount, action: "user: review and approve in the heichel queue" });
			}

			// --- 3. Comments ---
			const heichels = heichelsFromReport(report);
			let commentStats = { queuedCount: 0, byTriage: {} };
			for (const heichelId of heichels) {
				const r = await api("GET", `/heichelos/${encodeURIComponent(heichelId)}/submittedComments`);
				if (!r.ok) continue;
				const items = Array.isArray(r.data) ? r.data : (r.data && (r.data.success || r.data.comments || r.data.items)) || [];
				for (const item of [].concat(items)) {
					if (!item || typeof item !== "object") continue;
					const triage = triageComment(item);
					commentStats.queuedCount++;
					commentStats.byTriage[triage.verdict] = (commentStats.byTriage[triage.verdict] || 0) + 1;
					if (triage.verdict === "empty") {
						queued.push({ kind: "comment_empty_deny_candidate", heichelId, commentId: item.commentId || item.id, aliasId: item.aliasId || item.alias, action: "user: deny via socialCommentDeny" });
					} else if (triage.verdict !== "clean") {
						queued.push({ kind: `comment_${triage.verdict}`, heichelId, commentId: item.commentId || item.id, aliasId: item.aliasId || item.alias, reason: triage.reason, action: "user: review via socialCommentsQueue, then approve/deny" });
					}
				}
			}
			managed.push(`comments: ${commentStats.queuedCount} queued triaged across ${heichels.length} heichels`);
			if ((commentStats.byTriage.spam || 0) + (commentStats.byTriage.needs_review || 0) > 0) {
				attention.push(`${commentStats.byTriage.spam || 0} spam + ${commentStats.byTriage.needs_review || 0} comments need review`);
			}

			return {
				ok: true,
				action: "socialManagerRun",
				scannedAt: new Date().toISOString(),
				aliases: aliasIds.length,
				posts: totals.posts || 0,
				heichels,
				managed,
				queued,
				needsAttention: attention.length ? attention : null,
				summary: `Managed: ${managed.join("; ")}. Queued: ${queued.length} work items. Attention: ${attention.length ? attention.join("; ") : "nothing"}.`
			};
		}
	};
}

module.exports = { buildSocialManagerActions };
