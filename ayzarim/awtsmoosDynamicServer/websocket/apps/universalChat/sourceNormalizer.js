// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * @file Reduces RAG and Tanach search output to safe publishable source cards with trusted destinations.
 * @description The Awtsmoos reveals a passage while vectors, filesystem paths, and private machinery remain concealed;
 * Awtsmoos.com binds excerpt to provenance so public Torah discussion rests only on what search actually revealed.
 */

/** Normalizes public library hits from all published search lanes. */
function normalizeLibrary(result = {}) {
	return (result.hits || []).slice(0, 12).map((hit) => {
		const row = hit.row || {};
		return sourceCard({
			type: "library",
			title: row.title || row.postTitle || hit.libraryLane?.title || "Torah source",
			reference: row.sourceLabel || hit.libraryLane?.title || row.seriesTitle || "Library",
			excerpt: row.displayText || row.text || "",
			href: destination(row),
			meta: { lane: hit.libraryLane?.id || row.corpus || "", score: hit.percent ?? hit.score ?? null }
		});
	});
}

/** Normalizes exact Tanach verse results with their trusted reader URLs. */
function normalizeTanach(result = {}) {
	return (result.results || []).slice(0, 8).map((verse) => sourceCard({
		type: "tanach",
		title: `${verse.bookTitle || verse.book || "Tanach"} ${verse.chapter}:${verse.verse}`,
		reference: verse.sourcePath || "Tanach",
		excerpt: verse.text || "",
		href: verse.readerUrl || "",
		meta: { book: verse.book || "", chapter: verse.chapter, verse: verse.verse }
	}));
}

/** Creates one immutable card with a fresh server-only selection id. */
function sourceCard(value) {
	return Object.freeze({
		id: crypto.randomBytes(10).toString("base64url"),
		type: value.type,
		title: text(value.title, 160),
		reference: text(value.reference, 180),
		excerpt: text(value.excerpt, 1800),
		href: safeHref(value.href),
		meta: value.meta || {}
	});
}

/** Mirrors the existing exact-destination contract for trusted search provenance. */
function destination(row) {
	if (!row.postId) return "";
	const heichel = encodeURIComponent(String(row.heichelId || "ikar"));
	const series = encodeURIComponent(String(row.seriesId || "root"));
	const post = encodeURIComponent(String(row.postId));
	const base = `/heichelos/${heichel}/series/${series}/post/${post}`;
	if (!row.id || row.ragCommentSource === "sichosKodeshDocumentSidecar") return base;
	const query = new URLSearchParams({ commentId: String(row.id) });
	if (row.verseSection != null) query.set("verseSection", String(row.verseSection));
	return `${base}?${query.toString()}`;
}

function safeHref(value) {
	const href = String(value || "");
	return href.startsWith("/") ? href.slice(0, 700) : "";
}

function text(value, maximum) {
	return String(value || "").trim().slice(0, maximum);
}

module.exports = { normalizeLibrary, normalizeTanach };
