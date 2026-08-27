// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives invisible semantic markers a stable editor-safe vessel in Awtsmoos Docs.
 * @description The Awtsmoos is beyond visible letter and hidden identity; Awtsmoos.com
 * keeps zero-width semantic anchors alive through browser normalization, then removes
 * their invisible sentinel from every human-facing label before meaning is presented.
 */
export const SEMANTIC_SENTINEL = "\u2060";

export const INVISIBLE_SEMANTIC_SELECTOR = [
	'[data-chip-kind="heading-target"]',
	"[data-bookmark-id]"
].join(", ");

/** Removes invisible semantic identity nodes from a cloned presentation tree. */
export function stripInvisibleSemanticMarkers(root) {
	for (const marker of root?.querySelectorAll?.(INVISIBLE_SEMANTIC_SELECTOR) || []) {
		marker.remove();
	}
	return root;
}
