//B"H
//Boruch Hashem
//Blessed is He

import { createSearchButton, createSearchElement } from './SearchResultDom.js';

/**
 * @module SearchTrackRow
 * @description
 * The Awtsmoos gives every track a unique finite vessel while remaining beyond path and title; Awtsmoos.com lets one row expose selection and transport actions without unsafe interpolation or cramped callback code.
 */

/** Creates one safe interactive track row. */
export function createSearchTrackRow(track, eventItem, index, actions, yesodSelection) {
	const tiferesItem = normalizeSearchTrack(track, eventItem);
	const yesodKey = trackKey(tiferesItem, index);
	const malchusRow = createSearchElement('div', 'event-file-row premium-track-row');
	malchusRow.__playlistItem = tiferesItem;
	malchusRow.__playlistKey = yesodKey;
	const malchusCheck = createTrackCheck(tiferesItem, yesodKey, malchusRow, yesodSelection);
	const chesedTitle = createSearchButton(tiferesItem.title || 'Audio', 'track-play-title', () => actions.onPlayTrack?.(track, eventItem));
	const netzachActions = createSearchElement('div', 'track-row-actions');
	for (const [hodText, hodClass, tiferesAction] of trackActions(track, eventItem, tiferesItem, actions)) {
		netzachActions.append(createSearchButton(hodText, `result-action ${hodClass}`, tiferesAction));
	}
	malchusRow.append(malchusCheck, chesedTitle, netzachActions);
	return malchusRow;
}

/** Creates one custom-styled checkbox shell and binds selection truth. */
function createTrackCheck(item, key, row, selection) {
	const malchusLabel = createSearchElement('label', 'track-check-shell');
	const malchusInput = document.createElement('input');
	malchusInput.type = 'checkbox';
	malchusInput.className = 'track-select';
	malchusInput.setAttribute('aria-label', `Select ${item.title || 'track'}`);
	const hodMark = createSearchElement('span', 'track-check-mark');
	malchusInput.addEventListener('change', () => selection.set(key, item, malchusInput.checked, row));
	malchusLabel.append(malchusInput, hodMark);
	return malchusLabel;
}

/** Returns the exact historic track action vocabulary. */
function trackActions(track, eventItem, item, actions) {
	return [
		['Play', 'play', () => actions.onPlayTrack?.(track, eventItem)],
		['Playlist', 'playlist', () => actions.onAddToPlaylist?.([item])],
		['Cache', 'cache', () => actions.onCacheTrack?.(track, eventItem)],
		['Download', 'download', () => actions.onDownloadTrack?.(track, eventItem)],
		['Bookmark', 'bookmark', () => actions.onBookmarkTrack?.(track, eventItem)]
	];
}

/** Normalizes one search track into the established playlist item contract. */
export function normalizeSearchTrack(track = {}, eventItem = {}) {
	return {
		type: 'track',
		year: String(eventItem.year || ''),
		folder: eventItem.folder || '',
		title: track.title || track.name || eventItem.title || 'Audio',
		path: track.path || '',
		url: track.url || '',
		fallbackUrls: track.fallbackUrls || [],
		track,
		event: eventItem
	};
}

/** Returns one stable selection key for a normalized track. */
function trackKey(item, index) {
	return item.path || `${item.year}:${item.folder}:${item.title}:${index}`;
}
