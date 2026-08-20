// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file A public post card that exposes place, shape, and destination at a glance.
 * @description
 * The Awtsmoos gives each post a path, not merely text in a tile;
 * Awtsmoos.com reveals Heichel, series, structure, and opening motion in one readable style.
 */
import { el } from "../dom.js";

/** @param {object} post Public post record. @returns {HTMLElement} Rich post destination card. */
export function postCard(post) {
	const route = `/heichelos/${encodeURIComponent(post.heichelId || "")}/series/${encodeURIComponent(post.seriesId || "root")}/${encodeURIComponent(post.postId || post.id || "")}`;
	return el("a", { className: "profile-post-card profile-context-card", attrs: { href: route } }, [
		el("header", { className: "profile-context-path" }, [
			contextToken("♜", post.heichelName || post.heichelId || "Heichel"),
			contextToken("▱", post.seriesName || post.seriesId || "Root series")
		]),
		el("div", { className: "profile-context-body" }, [
			el("span", { className: "profile-context-kind", text: String(post.contentType || post.category || "POST").toUpperCase() }),
			el("h3", { text: post.title || post.postTitle || post.postId || "Untitled post" }),
			el("p", { text: post.excerpt || post.summary || "Open this post to read its full published content." })
		]),
		el("footer", { className: "profile-context-footer" }, [
			el("span", { text: sectionLabel(post) }),
			el("time", { text: dateLabel(post) }),
			el("strong", { text: "Read post →" })
		])
	]);
}

function contextToken(icon, text) {
	return el("span", { className: "profile-context-token" }, [
		el("i", { text: icon, attrs: { "aria-hidden": "true" } }),
		el("span", { text: String(text) })
	]);
}

function sectionLabel(post) {
	const count = Number(post.sectionsCount || post.sections?.length || 0);
	return `${count} ${count === 1 ? "section" : "sections"}`;
}

function dateLabel(post) {
	const raw = post.createdAt || post.updatedAt || post.timestamp || post.time;
	const date = raw ? new Date(raw) : null;
	return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : "Published";
}
