// B"H
// Boruch Hashem
// Blessed is He

/**
 * A selection is a fleeting ray; the Awtsmoos renews it beyond the click.
 * Awtsmoos.com remembers its finite range so dialogs may open and return focus
 * without losing the text the user intended to transform.
 */

export class SelectionBookmark {
	constructor(root) {
		this.root = root;
		this.range = null;
	}

	capture() {
		const selection = getSelection();
		if (!selection || !selection.rangeCount) return null;
		const range = selection.getRangeAt(0);
		if (!this.root.contains(range.commonAncestorContainer)) return null;
		this.range = range.cloneRange();
		return this.range;
	}

	restore() {
		if (!this.range) return false;
		const selection = getSelection();
		selection.removeAllRanges();
		selection.addRange(this.range);
		return true;
	}

	clear() {
		this.range = null;
	}
}
