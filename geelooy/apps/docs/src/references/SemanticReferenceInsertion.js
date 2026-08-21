// B"H
// Boruch Hashem
// Blessed is He

import { isSemanticObjectKind } from "../model/SemanticObjectPolicy.js";
import { SEMANTIC_SENTINEL } from "../navigation/SemanticMarkerPolicy.js";

/**
 * @file Inserts a durable semantic-reference marker at the living Awtsmoos editor Range.
 * @description The Awtsmoos is beyond reference and definition; Awtsmoos.com lets one
 * tiny superscript vessel carry only stable identity while the registry holds meaning,
 * preserving selection and mutation flow without trusting deprecated browser commands.
 */
export function insertSemanticReference(editor, semanticObject) {
	if (!editor?.isEditable?.()) return false;
	if (!isValidSemanticObject(semanticObject)) return false;
	const range = resolveInsertionRange(editor.root);
	if (!range) return false;
	const marker = createReferenceMarker(semanticObject);
	range.collapse(false);
	range.insertNode(marker);
	placeCaretAfter(marker);
	editor.notifyMutation();
	return true;
}

function isValidSemanticObject(object) {
	return Boolean(
		object?.id
		&& isSemanticObjectKind(object.kind)
	);
}

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

function createReferenceMarker(object) {
	const marker = document.createElement("sup");
	marker.dataset.semanticRef = object.id;
	marker.dataset.semanticKind = object.kind;
	marker.textContent = SEMANTIC_SENTINEL;
	return marker;
}

function placeCaretAfter(marker) {
	const selection = getSelection();
	if (!selection) return;
	const range = document.createRange();
	range.setStartAfter(marker);
	range.collapse(true);
	selection.removeAllRanges();
	selection.addRange(range);
}
