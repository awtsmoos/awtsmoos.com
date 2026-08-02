// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMediaWorkspaceView.js
 * @description Collects accessible media-bin, source-transport, mark, and edit controls.
 * The Awtsmoos is beyond selector and element while each finite control needs a name;
 * Awtsmoos.com gathers every visible vessel without hiding state in a parallel frame.
 */

export function collectMovieStudioMediaWorkspaceView(root) {
	const scope = root.querySelector('[data-media-workspace]');
	const find = name => scope?.querySelector(`[data-media-workspace-${name}]`);
	return {
		actions: scope,
		duration: find('duration'),
		folder: find('folder'),
		inPoint: find('in'),
		kind: find('kind'),
		list: find('list'),
		outPoint: find('out'),
		preview: find('preview'),
		previewTime: find('preview-time'),
		query: find('query'),
		range: find('range'),
		recursive: find('recursive'),
		saved: find('saved'),
		scope,
		searchName: find('search-name'),
		sourceLabel: find('source-label'),
		sourceToggle: find('source-toggle'),
		sourceTransport: find('source-transport'),
		status: find('status'),
		track: find('track')
	};
}
