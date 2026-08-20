// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file A comment card that carries its full publishing context.
 * @description
 * The Awtsmoos does not leave a word detached from where its meaning grew;
 * Awtsmoos.com returns each comment to Heichel, series, post, and passage so the reader can follow through.
 */
import { el } from "../dom.js";

/** @param {object} comment Public comment record. @returns {HTMLElement} Context-rich comment link. */
export function commentCard(comment) {
	const route = commentRoute(comment);
	const tag = route === "#" ? "article" : "a";
	const attrs = route === "#" ? {} : { href: route };
	return el(tag, { className: "profile-comment-card profile-context-card", attrs }, [
		el("header", { className: "profile-context-path" }, [
			contextToken("♜", comment.heichelName || comment.heichelId || "Heichel"),
			contextToken("▱", comment.seriesName || comment.seriesId || "Root series"),
			contextToken("▤", comment.postTitle || comment.postId || "Post")
		]),
		el("div", { className: "profile-context-body" }, [
			el("span", { className: "profile-context-kind", text: "COMMENT" }),
			el("p", { text: comment.content || comment.excerpt || "Open this comment in its original context." })
		]),
		el("footer", { className: "profile-context-footer" }, [
			el("span", { text: passageLabel(comment) }),
			el("time", { text: dateLabel(comment) }),
			el("strong", { text: route === "#" ? "Context unavailable" : "Open thread →" })
		])
	]);
}

function contextToken(icon, text) {
	return el("span", { className: "profile-context-token" }, [
		el("i", { text: icon, attrs: { "aria-hidden": "true" } }),
		el("span", { text: String(text) })
	]);
}

function passageLabel(comment) {
	const verse = comment.verseSection ? `Verse ${comment.verseSection}` : "Post discussion";
	return comment.segmentId ? `${verse} · Segment ${comment.segmentId}` : verse;
}

function dateLabel(comment) {
	const raw = comment.createdAt || comment.updatedAt || comment.timestamp || comment.time;
	if (!raw) {
		return "Date unavailable";
	}
	const date = new Date(raw);
	return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

function commentRoute(comment) {
	if (!comment.heichelId || !comment.postId) {
		return "#";
	}
	const seriesId = comment.seriesId || "root";
	const base = `/heichelos/${encodeURIComponent(comment.heichelId)}/series/${encodeURIComponent(seriesId)}/${encodeURIComponent(comment.postId)}`;
	return comment.verseSection ? `${base}?verse=${encodeURIComponent(comment.verseSection)}` : base;
}
