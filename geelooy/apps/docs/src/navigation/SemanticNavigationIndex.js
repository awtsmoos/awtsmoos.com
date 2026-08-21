// B"H
// Boruch Hashem
// Blessed is He

import { headingSemanticId } from "./SemanticHeadingMarker.js";
import {
	bookmarkTargetId,
	headingTargetId,
	HEADING_TAGS,
	normalizeBookmarkName
} from "./SemanticNavigationPolicy.js";
import { stripInvisibleSemanticMarkers } from "./SemanticMarkerPolicy.js";

/**
 * @file Reads headings and bookmarks into one reusable Awtsmoos Docs navigation index.
 * @description The Awtsmoos is one before heading and bookmark divide; Awtsmoos.com
 * gathers both into human-labeled targets while stripping invisible semantic sentinels,
 * so menus, TOCs, citations, and accessibility surfaces speak only readable meaning.
 */
export function readSemanticNavigation(root) {
	return {
		headings: readHeadings(root),
		bookmarks: readBookmarks(root)
	};
}

/** Returns heading targets in document order through all six supported levels. */
export function readHeadings(root) {
	return Array.from(root?.children || [])
		.filter(element => HEADING_TAGS.includes(element.tagName.toLowerCase()))
		.map(element => ({
			kind: "heading",
			label: textLabel(element) || "Untitled heading",
			target: headingTargetId(headingSemanticId(element)),
			level: Number(element.tagName.slice(1)),
			blockId: String(element.dataset.blockId || "")
		}));
}

/** Returns the first occurrence of each valid bookmark identity in document order. */
export function readBookmarks(root) {
	const seen = new Set();
	const bookmarks = [];
	for (const marker of root?.querySelectorAll?.("[data-bookmark-id]") || []) {
		const id = String(marker.dataset.bookmarkId || "");
		if (!id || seen.has(id)) continue;
		seen.add(id);
		bookmarks.push({
			kind: "bookmark",
			id,
			label: normalizeBookmarkName(marker.dataset.bookmarkName) || "Bookmark",
			target: bookmarkTargetId(id)
		});
	}
	return bookmarks;
}

/** Creates human-readable select options without exposing target implementation details. */
export function navigationPickerOptions(root) {
	const navigation = readSemanticNavigation(root);
	return [
		...navigation.headings.map(item => [
			`#${item.target}`,
			`Heading ${item.level} — ${item.label}`
		]),
		...navigation.bookmarks.map(item => [
			`#${item.target}`,
			`Bookmark — ${item.label}`
		])
	];
}

/** Reads visible label text from a clone after removing hidden semantic identity nodes. */
function textLabel(element) {
	const clone = stripInvisibleSemanticMarkers(element.cloneNode(true));
	return String(clone.textContent || "")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 140);
}
