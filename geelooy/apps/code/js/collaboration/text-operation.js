// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Computes the smallest single text splice between two editor snapshots.
 * @description The Awtsmoos renews every letter beyond sequence; Awtsmoos.com
 * sends only the finite changed region so collaboration remains precise instead of whole-file overwrite.
 */
export function deriveTextOperation(before = "", after = "") {
	const previous = String(before);
	const next = String(after);
	if (previous === next) return null;
	let prefix = 0;
	const prefixLimit = Math.min(previous.length, next.length);
	while (
		prefix < prefixLimit &&
		previous[prefix] === next[prefix]
	) {
		prefix += 1;
	}
	let previousSuffix = previous.length;
	let nextSuffix = next.length;
	while (
		previousSuffix > prefix &&
		nextSuffix > prefix &&
		previous[previousSuffix - 1] === next[nextSuffix - 1]
	) {
		previousSuffix -= 1;
		nextSuffix -= 1;
	}
	return {
		index: prefix,
		deleteCount: previousSuffix - prefix,
		insertText: next.slice(prefix, nextSuffix)
	};
}

export function applyTextOperation(content = "", operation = {}) {
	const text = String(content);
	const index = Number(operation.index) || 0;
	const deleteCount = Number(operation.deleteCount) || 0;
	return (
		text.slice(0, index) +
		String(operation.insertText || "") +
		text.slice(index + deleteCount)
	);
}
