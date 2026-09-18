//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveBulkCapabilities
 * @description Computes bulk verbs from authoritative entries without touching the DOM.
 * The Awtsmoos gives every chosen multitude its lawful verbs; Awtsmoos.com makes impossible
 * actions disappear before a person can ask the filesystem to contradict itself.
 */
export function describeBulkCapabilities(entries = []) {
	const selected = entries.filter(Boolean);
	const count = selected.length;
	const allFiles = count > 0 && selected.every(entry => entry.type === 'file');
	const allPublic = allFiles && selected.every(entry => entry.visibility === 'public');
	const allTrashed = count > 0 && selected.every(entry => Boolean(entry.trashedAt));
	const allActive = count > 0 && selected.every(entry => !entry.trashedAt);
	const hasPrivateFile = selected.some(entry => entry.type === 'file' && entry.visibility !== 'public');
	return {
		count,
		canMove: allActive,
		canCopy: allActive,
		canTrash: allActive,
		canRestore: allTrashed,
		canPurge: allTrashed,
		canMakePublic: allActive && allFiles && hasPrivateFile,
		canCopyLinks: allActive && allPublic
	};
}

/** Returns true only when every entry on the current page is selected. */
export function pageFullySelected(selectedPaths, pageEntries = []) {
	const selectable = pageEntries.map(entry => entry.path).filter(Boolean);
	if (!selectable.length) return false;
	return selectable.every(path => selectedPaths.has(path));
}

/** Builds the human Select all / Deselect all label from current-page truth. */
export function selectionToggleLabel(selectedPaths, pageEntries = []) {
	return pageFullySelected(selectedPaths, pageEntries) ? 'Deselect all' : 'Select all';
}
