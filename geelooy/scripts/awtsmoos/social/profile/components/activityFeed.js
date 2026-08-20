// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file A contextual recent-activity stream for the public alias.
 * @description
 * The Awtsmoos turns motion into memory without flattening where it began;
 * Awtsmoos.com lets every recent act reveal its kind, its place, its time, and its next span.
 */
import { el, emptyCard } from "../dom.js";

/** @param {object[]} items Public activity records. @returns {HTMLElement} Rich recent-activity stream. */
export function activityFeed(items = []) {
	if (!items.length) {
		return el("section", { className: "profile-activity-feed" }, [
			emptyCard("No recent public activity is available for this alias yet.")
		]);
	}
	return el("section", { className: "profile-activity-feed" }, [
		el("div", { className: "profile-activity-summary" }, [
			el("strong", { text: `${items.length} recent signals` }),
			el("span", { text: "Newest public activity, with its original context preserved." })
		]),
		el("div", { className: "profile-activity-list" }, items.map(activityCard))
	]);
}

function activityCard(item) {
	const source = item.source || item;
	const kind = String(item.kind || item.type || "activity");
	const route = routeFor(item, source);
	const tag = route === "#" ? "article" : "a";
	const attrs = route === "#" ? {} : { href: route };
	return el(tag, { className: `profile-activity-item ${kind}`, attrs }, [
		el("span", { className: "profile-activity-orb", text: glyphFor(kind), attrs: { "aria-hidden": "true" } }),
		el("span", { className: "profile-activity-copy" }, [
			el("span", { className: "profile-activity-meta" }, [
				el("strong", { text: kind.toUpperCase() }),
				el("time", { text: timeFor(source) })
			]),
			el("h3", { text: titleFor(item, source) }),
			el("p", { text: source.excerpt || source.content || source.summary || "Open this activity in its original context." }),
			el("small", { text: placeFor(source) })
		]),
		el("b", { className: "profile-activity-arrow", text: route === "#" ? "·" : "›", attrs: { "aria-hidden": "true" } })
	]);
}

function routeFor(item, source) {
	if (!source.heichelId || !(source.postId || source.id)) {
		return "#";
	}
	const postId = source.postId || source.id;
	const seriesId = source.seriesId || "root";
	return `/heichelos/${encodeURIComponent(source.heichelId)}/series/${encodeURIComponent(seriesId)}/${encodeURIComponent(postId)}`;
}

function titleFor(item, source) {
	if ((item.kind || item.type) === "comment") {
		return `Commented on ${source.postTitle || source.postId || "a post"}`;
	}
	return source.title || item.title || source.postTitle || source.id || "Public activity";
}

function placeFor(source) {
	return [source.heichelName || source.heichelId, source.seriesName || source.seriesId, source.postTitle]
		.filter(Boolean)
		.join(" › ") || "Public alias activity";
}

function timeFor(source) {
	const raw = source.createdAt || source.updatedAt || source.timestamp || source.time;
	const date = raw ? new Date(raw) : null;
	return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : "Recent";
}

function glyphFor(kind) {
	return kind === "comment" ? "◌" : kind === "post" ? "✦" : "◷";
}
