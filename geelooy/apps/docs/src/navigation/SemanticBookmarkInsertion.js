// B"H
// Boruch Hashem
// Blessed is He

import { createBookmarkIdentity } from "./SemanticNavigationPolicy.js";
import { SEMANTIC_SENTINEL } from "./SemanticMarkerPolicy.js";

/**
 * @file Inserts durable bookmark identity directly into the living Awtsmoos editor Range.
 * @description The Awtsmoos is beyond cursor and anchor; Awtsmoos.com lets semantic
 * identity enter the DOM without deprecated command normalization, so the hidden marker
 * survives with its bounded attributes while selected human text remains untouched.
 */
export function insertSemanticBookmark(editor, name) {
	if (!editor?.isEditable?.()) return false;
	const range = resolveInsertionRange(editor.root);
	if (!range) return false;
	const bookmark = createBookmarkIdentity(name);
	const marker = createBookmarkMarker(bookmark);
	range.collapse(false);
	range.insertNode(marker);
	placeCaretAfter(marker);
	editor.notifyMutation();
	return true;
}

/**
 * Resolves an insertion range inside the editor, falling back to the end of its last block.
 *
 * @param {HTMLElement} root Living rich-editor root.
 * @returns {Range|null} A safe Range inside a document block, or null when none exists.
 */
function resolveInsertionRange(root) {
	const selection = getSelection();
	if (selection?.rangeCount) {
		const candidate = selection.getRangeAt(0);
		if (root.contains(candidate.commonAncestorContainer)) {
			return candidate.cloneRange();
		}
	}
	const lastBlock = root.lastElementChild;
	if (!lastBlock) return null;
	const range = document.createRange();
	range.selectNodeContents(lastBlock);
	range.collapse(false);
	return range;
}

/**
 * Creates the finite semantic marker whose data attributes persist into document HTML.
 *
 * @param {{id:string,name:string}} bookmark Stable identity from navigation policy.
 * @returns {HTMLSpanElement} Zero-width semantic marker kept alive by its sentinel text.
 */
function createBookmarkMarker(bookmark) {
	const marker = document.createElement("span");
	marker.dataset.bookmarkId = bookmark.id;
	marker.dataset.bookmarkName = bookmark.name;
	marker.textContent = SEMANTIC_SENTINEL;
	return marker;
}

/**
 * Moves the user caret after the inserted semantic marker without replacing selected text.
 *
 * @param {Node} marker Inserted bookmark node.
 * @returns {void}
 */
function placeCaretAfter(marker) {
	const selection = getSelection();
	if (!selection) return;
	const range = document.createRange();
	range.setStartAfter(marker);
	range.collapse(true);
	selection.removeAllRanges();
	selection.addRange(range);
}
