// B"H
/**
 * @module NavigationFooter
 * @description
 * The Awtsmoos preserves every chapter's true identity. Previous and next
 * gates point to canonical post-ID routes, never ambiguous numeric shorthand.
 */

import { GenesisEngine } from "../dom/GenesisEngine.js";

function cleanSearch() {
	const parameters = new URLSearchParams(location.search);
	[
		"idx",
		"sub",
		"verse",
		"verseIndex",
		"section",
		"sectionIndex",
		"paragraph",
		"para"
	].forEach(key => parameters.delete(key));
	const serialized = parameters.toString();
	return serialized ? `?${serialized}` : "";
}

function readerIdentity(seriesParent) {
	const parts = location.pathname.split("/").filter(Boolean).map(decodeURIComponent);
	const heichelMarker = parts.indexOf("heichelos");
	const seriesMarker = parts.indexOf("series");
	return {
		heichelId: window.heichelId || parts[heichelMarker + 1] || "",
		seriesId: seriesParent?.id || window.series?.id || window.post?.parentSeriesId || parts[seriesMarker + 1] || "root"
	};
}

function chapterHref(seriesParent, targetIndex) {
	const postId = Array.isArray(seriesParent?.posts)
		? seriesParent.posts[targetIndex]
		: "";
	if (!postId) return "#";
	const { heichelId, seriesId } = readerIdentity(seriesParent);
	return `/heichelos/${encodeURIComponent(heichelId)}`
		+ `/series/${encodeURIComponent(seriesId)}`
		+ `/post/${encodeURIComponent(postId)}`
		+ cleanSearch();
}

function gate(seriesParent, id, label, index, direction) {
	return {
		tag: "a",
		attr: {
			id,
			class: `awtsmoos-chapter-gate awtsmoos-chapter-gate-${direction}`,
			href: chapterHref(seriesParent, index),
			"data-target-chapter": String(index),
			"aria-label": label
		},
		children: [
			{
				tag: "span",
				attr: { class: "awtsmoos-chapter-gate-arrow" },
				text: direction === "previous" ? "←" : "→"
			},
			{
				tag: "span",
				attr: { class: "awtsmoos-chapter-gate-label" },
				text: label
			},
			{
				tag: "span",
				attr: { class: "awtsmoos-chapter-gate-number" },
				text: `Chapter ${index + 1}`
			}
		]
	};
}

/** Forges canonical previous and next chapter gates. */
export function makeNavBars(post, seriesParent, indexInSeries) {
	if (!seriesParent || !Array.isArray(seriesParent.posts)) {
		return document.createTextNode("");
	}
	const currentIndex = Number.parseInt(indexInSeries, 10) || 0;
	const length = seriesParent.posts.length;
	const plan = {
		tag: "nav",
		attr: {
			class: "awtsmoos-chapter-nav",
			"aria-label": "Chapter navigation"
		},
		children: [
			{
				tag: "div",
				attr: { class: "awtsmoos-chapter-nav-status" },
				children: [
					{ tag: "span", text: "Chapter" },
					{ tag: "strong", text: `${currentIndex + 1}` },
					{ tag: "span", text: `/ ${length}` }
				]
			}
		]
	};
	if (currentIndex > 0) {
		plan.children.push(gate(seriesParent, "last", "Previous", currentIndex - 1, "previous"));
	}
	if (currentIndex < length - 1) {
		plan.children.push(gate(seriesParent, "next", "Next", currentIndex + 1, "next"));
	}
	return GenesisEngine.manifest(plan);
}
