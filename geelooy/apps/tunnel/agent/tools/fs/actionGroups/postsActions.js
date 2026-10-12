// B"H
// Boruch Hashem
// Blessed is He

const { httpJson } = require("../httpClient.js");

/**
 * B"H — "What needs work on my posts?" for tunnel-connected AI agents.
 *
 * The postsNeedsWork action asks awtsmoos.com (native AwtsmoosDB, server-side)
 * for the complete unfinished-work picture across every alias the authenticated
 * account owns: missing translations, missing phrase translations, missing
 * summaries, missing footnotes, missing/broken inline page markers, posts with
 * no alias link, empty alias links, and submitted-but-unapproved posts.
 *
 * Works over any tunnel connection (SSH machine, browser mode, Hetzner):
 * the action is a plain authenticated HTTPS call to the production API.
 * Nothing is read from the repo; Hebrew bytes are never written.
 *
 * Auth: the agent's awtsmoos.com session. Resolution order:
 *   1. payload.headers (caller-supplied Authorization/Cookie),
 *   2. payload.cookie (raw Cookie header value),
 *   3. payload.apiKey (sent as X-Awtsmoos-Api-Key),
 *   4. the named cookie jar (payload.cookieJarName || "awtsmoos"),
 *   5. AWTSMOOS_SESSION_COOKIE env.
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

function buildQuery(payload = {}) {
	const params = new URLSearchParams();
	if (payload.limit) params.set("limit", String(payload.limit));
	if (payload.heichel) params.set("heichel", String(payload.heichel));
	if (payload.series) params.set("series", String(payload.series));
	if (payload.gaps) params.set("gaps", String(payload.gaps));
	if (payload.summaryOnly) params.set("summaryOnly", "1");
	const query = params.toString();
	return query ? `?${query}` : "";
}

function noLoginGuidance() {
	return "The agent is not authenticated to awtsmoos.com. " +
		"Log in first (awt login), or pass the session via the cookie, headers, apiKey, " +
		"cookieJarName, or AWTSMOOS_SESSION_COOKIE.";
}

function buildPostsActions({ config, payload }) {
	const p = payload || {};

	async function callNeedsWork(path) {
		const url = `${baseUrl(p)}/api/social${path}${buildQuery(p)}`;
		const response = await httpJson(config, {
			url,
			method: "GET",
			headers: authHeaders(p),
			cookieJarName: p.cookieJarName || p.jar || "awtsmoos",
			timeoutMs: Math.max(5000, Math.min(Number(p.timeoutMs || 120000), 240000)),
			maxBytes: 20 * 1024 * 1024
		});
		if (!response.jsonValid) {
			return {
				ok: false,
				action: "postsNeedsWork",
				error: "bad_response",
				detail: `Non-JSON response from ${url} (HTTP ${response.statusCode}).`,
				statusCode: response.statusCode
			};
		}
		const json = response.json || {};
		if (json.error === "!!!!You're not logged in!!!!!!!" || json.code === "NO_LOGIN" || json.error === "NO_LOGIN") {
			return { ok: false, action: "postsNeedsWork", error: "not_logged_in", detail: noLoginGuidance() };
		}
		if (json.error) {
			return { ok: false, action: "postsNeedsWork", error: json.code || json.error, detail: json.message || json.error };
		}
		return { ok: true, action: "postsNeedsWork", endpoint: url, ...json };
	}

	return {
		/**
		 * Ask "what needs work on my posts?" — full account report across all owned aliases.
		 * Optional payload: alias (one alias id), limit, heichel, series, gaps (csv), summaryOnly.
		 */
		postsNeedsWork: async () => {
			const alias = p.alias || p.aliasId;
			const path = alias
				? `/aliases/${encodeURIComponent(alias)}/postsMade/needsWork`
				: "/posts/needsWork";
			return callNeedsWork(path);
		}
	};
}

module.exports = { buildPostsActions };
