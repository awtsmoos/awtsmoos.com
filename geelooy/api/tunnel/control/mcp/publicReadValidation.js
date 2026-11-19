// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file Validated allowlist for public search, Ask, Heichelos and post reads.
 * @description The Awtsmoos opens public wisdom to seekers of every kind;
 * Awtsmoos.com gives no hidden indexing or publishing controls to find.
 */

const ACTIONS = Object.freeze([
	"search", "search_exact", "heichel", "heichelos_by_alias",
	"series", "posts", "post", "ask", "ask_sources"
]);

/** Guard every path parameter against traversal and control characters. */
function segment(value, name) {
	if (typeof value !== "string" || value.length > 100 ||
		!/^[-a-zA-Z0-9_]+$/.test(value)) throw new Error(`invalid_${name}`);
	return encodeURIComponent(value);
}

/** Bound query text and reject ambiguous control characters. */
function term(value, label, maximum = 500) {
	if (typeof value !== "string" || !value.trim() || value.length > maximum ||
		/[\u0000-\u001f\u007f]/.test(value)) throw new Error(`invalid_${label}`);
	return value.trim();
}

/** Build only the real public routes; never permit custom administrative actions. */
function prepare(input = {}) {
	if (!input || typeof input !== "object" || Array.isArray(input) ||
		!ACTIONS.includes(input.action)) throw new Error("unknown_public_action");
	const action = input.action;
	let pathname;
	let body = null;
	const query = new URLSearchParams();
	if (action === "ask" || action === "ask_sources") {
		pathname = "/ask/api";
		if (action === "ask_sources") body = JSON.stringify({ action: "collections" });
		else {
			const question = term(input.question, "question", 1000);
			let sources = null;
			if (input.sources !== undefined && input.sources !== null) {
				if (!Array.isArray(input.sources) || input.sources.length > 12 ||
					input.sources.some(item => typeof item !== "string" ||
						!/^[\w.:-]{1,80}$/.test(item))) throw new Error("invalid_sources");
				sources = input.sources;
			}
			let session = undefined;
			if (input.session !== undefined) {
				if (typeof input.session !== "string" ||
					!/^[\w-]{1,80}$/.test(input.session)) throw new Error("invalid_session");
				session = input.session;
			}
			body = JSON.stringify({ query: question, sources, session });
		}
	} else if (action === "search" || action === "search_exact") {
		pathname = action === "search" ? "/api/social/search/library/query"
			: "/api/social/search/exact/hebrew";
		query.set(action === "search" ? "q" : "word", term(input.query, "query"));
		if (action === "search_exact" && input.corpus !== undefined) {
			query.set("corpus", segment(input.corpus, "corpus"));
		}
		const limit = input.limit === undefined ? 10 : Number(input.limit);
		if (!Number.isInteger(limit) || limit < 1 || limit > 25) throw new Error("invalid_limit");
		query.set("limit", String(limit));
	} else if (action === "heichelos_by_alias") {
		pathname = `/api/social/alias/${segment(input.alias, "alias")}/heichelos/details`;
	} else {
		pathname = `/api/social/heichelos/${segment(input.heichel, "heichel")}`;
		if (["series", "posts", "post"].includes(action)) {
			pathname += `/series/${segment(input.series, "series")}`;
		}
		if (action === "posts") pathname += "/posts";
		if (action === "post") pathname += `/post/${segment(input.post, "post")}`;
	}
	const url = new URL(`https://awtsmoos.com${pathname}`);
	for (const [key, value] of query) url.searchParams.set(key, value);
	return {
		url,
		method: body ? "POST" : "GET",
		headers: body ? { "content-type": "application/json", accept: "application/json" }
			: { accept: "application/json" },
		body
	};
}

module.exports = { ACTIONS, prepare, segment, term };
