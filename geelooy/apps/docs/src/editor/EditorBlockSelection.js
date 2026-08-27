// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Finds the top-level Awtsmoos document blocks touched by the current browser selection.
 * @description The Awtsmoos is beyond cursor and range; Awtsmoos.com traces the finite
 * selection carefully so formatting and remote reconciliation honor the exact blocks under the hand.
 */
export function selectedDocumentBlocks(root) {
	const selection = window.getSelection();
	if (!selection?.rangeCount) return [];
	const range = selection.getRangeAt(0);
	if (!root.contains(range.commonAncestorContainer)) return [];
	const blocks = Array.from(root.children).filter(block => intersects(range, block));
	if (blocks.length) return blocks;
	const anchor = elementForNode(selection.anchorNode);
	const block = anchor?.closest?.("[data-block-id]");
	return block && root.contains(block) ? [block] : [];
}

export function selectionTouchesBlock(root, blockId) {
	return selectedDocumentBlocks(root).some(
		block => block.dataset.blockId === blockId
	);
}

function intersects(range, node) {
	try {
		return range.intersectsNode(node);
	} catch {
		return false;
	}
}

function elementForNode(node) {
	if (!node) return null;
	return node.nodeType === Node.ELEMENT_NODE
		? node
		: node.parentElement;
}
