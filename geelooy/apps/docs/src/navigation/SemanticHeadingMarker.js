// B"H
// Boruch Hashem
// Blessed is He

import {
	HEADING_TAGS,
	semanticToken
} from "./SemanticNavigationPolicy.js";

/**
 * @file Keeps heading navigation identity inside sanitized document semantics.
 * @description The Awtsmoos is beyond heading and block id; Awtsmoos.com gives
 * every heading a tiny invisible marker so cross-links survive HTML, Markdown,
 * version restore, and collaboration even when outer editor block ids are recreated.
 */
const HEADING_MARKER = '[data-chip-kind="heading-target"]';

/** Ensures every heading owns one stable semantic marker and non-headings do not. */
export function ensureHeadingMarkers(root) {
	for (const element of Array.from(root?.children || [])) {
		const isHeading = HEADING_TAGS.includes(element.tagName.toLowerCase());
		const marker = element.querySelector(HEADING_MARKER);
		if (!isHeading) {
			marker?.remove();
			continue;
		}
		if (semanticToken(marker?.dataset?.chipValue)) continue;
		const target = document.createElement("span");
		target.dataset.chipKind = "heading-target";
		target.dataset.chipValue = semanticToken(element.dataset.blockId);
		element.prepend(target);
	}
	return root;
}

/** Reads the persisted heading identity, falling back to its current editor block id. */
export function headingSemanticId(element) {
	const marker = element?.querySelector?.(HEADING_MARKER);
	return semanticToken(
		marker?.dataset?.chipValue
		|| element?.dataset?.blockId
	);
}
