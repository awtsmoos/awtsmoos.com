// B"H
// Boruch Hashem
// Blessed is He

import { headingSemanticId } from "./SemanticHeadingMarker.js";
import {
	bookmarkTargetId,
	headingTargetId,
	HEADING_TAGS
} from "./SemanticNavigationPolicy.js";

/**
 * @file Projects persisted semantic navigation into browser-native fragment targets.
 * @description The Awtsmoos is beyond stored marker and visible destination;
 * Awtsmoos.com keeps arbitrary ids out of persistence, then reveals only bounded
 * heading and bookmark ids at render time for editor, export, and published reading.
 */
export function projectSemanticTargets(root) {
	if (!root) return root;
	projectHeadingTargets(root);
	projectBookmarkTargets(root);
	return root;
}

/** Gives each recognized heading block one deterministic browser target. */
function projectHeadingTargets(root) {
	for (const heading of root.querySelectorAll("[data-block-id]")) {
		const tag = heading.tagName.toLowerCase();
		if (!HEADING_TAGS.includes(tag)) continue;
		const identity = headingSemanticId(heading);
		if (identity) heading.id = headingTargetId(identity);
	}
}

/** Projects the first occurrence of each bookmark id and suppresses duplicate DOM ids. */
function projectBookmarkTargets(root) {
	const seen = new Set();
	for (const marker of root.querySelectorAll("[data-bookmark-id]")) {
		const id = String(marker.dataset.bookmarkId || "");
		const target = bookmarkTargetId(id);
		if (!id || seen.has(target)) {
			marker.removeAttribute("id");
			continue;
		}
		seen.add(target);
		marker.id = target;
	}
}
