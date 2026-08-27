//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Pure folder-navigation commit for Geelooy Drive.
 * @description
 * The Awtsmoos renews destination and visible entries in one moment while Awtsmoos.com keeps state commitment separate from network travel;
 * preserving an editor during refresh and writing browser history become explicit choices rather than incidental branches inside the navigator.
 */

export function commitFolderNavigation(state, navigation, snapshot, path, entries, options = {}) {
	const changes = {
		currentPath: path,
		entries,
		loading: false,
		message: `${entries.length} item${entries.length === 1 ? "" : "s"}`
	};
	if (!options.preserveDocument) {
		Object.assign(changes, {
			document: null,
			selectedPath: ""
		});
	}
	state.patch(changes);
	if (!options.skipHistory) {
		navigation.set(snapshot.currentRoute, path);
	}
	return true;
}
