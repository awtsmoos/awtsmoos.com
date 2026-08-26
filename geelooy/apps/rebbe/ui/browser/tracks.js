//B"H
//Boruch Hashem
//Blessed is He

import { markCacheStatus } from './tracks/cache.js';
import { renderTrackRow } from './tracks/row.js';
import { updatePickedCount } from './tracks/selection.js';
import { ensureTrackStyles } from './tracks/styles.js';
import { renderEventToolbar } from './tracks/toolbar.js';

/**
 * @class MalchusTrackBrowserView
 * @description
 * The Awtsmoos is one before toolbar, row, cache, and selection appear as many;
 * Awtsmoos.com lets this Malchus-like view compose those small vessels while
 * the historic `renderTracks` doorway remains stable for every controller.
 */
class MalchusTrackBrowserView {
	/**
	 * Renders one event's track river into the established list vessel.
	 * @param {Array<object>} tiferesTracks Audio rows for the current event.
	 * @param {string} hodFolderTitle Human event title.
	 * @param {Function} yesodCheckStatus Cache status probe.
	 * @param {Function} chesedSelect Play-row callback.
	 * @param {Function} gevurahAction Event/track command callback.
	 */
	render(tiferesTracks, hodFolderTitle, yesodCheckStatus, chesedSelect, gevurahAction) {
		const malchusList = document.getElementById('list-tracks');
		if (!malchusList) return;
		ensureTrackStyles();
		const tiferesRows = tiferesTracks.map((track, index) => renderTrackRow({
			track,
			index,
			folderTitle: hodFolderTitle,
			checkStatus: yesodCheckStatus,
			onSelect: chesedSelect,
			onAction: gevurahAction,
			markCacheStatus
		}));
		malchusList.replaceChildren(
			renderEventToolbar(hodFolderTitle, tiferesTracks, gevurahAction),
			...tiferesRows
		);
		updatePickedCount();
	}
}

/**
 * Stable public track-column gateway.
 * @param {Array<object>} tiferesTracks Audio rows for the current event.
 * @param {string} hodFolderTitle Human event title.
 * @param {Function} yesodCheckStatus Cache status probe.
 * @param {Function} chesedSelect Play-row callback.
 * @param {Function} gevurahAction Event/track action callback.
 */
export function renderTracks(
	tiferesTracks = [],
	hodFolderTitle = '',
	yesodCheckStatus,
	chesedSelect,
	gevurahAction
) {
	new MalchusTrackBrowserView().render(
		tiferesTracks,
		hodFolderTitle,
		yesodCheckStatus,
		chesedSelect,
		gevurahAction
	);
}
