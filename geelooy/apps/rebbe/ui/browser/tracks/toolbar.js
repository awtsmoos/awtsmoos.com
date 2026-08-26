//B"H
//Boruch Hashem
//Blessed is He

import { openAddToPlaylist, playlistTrackItem, selectedPlaylistItems } from '../../playlists.js';
import { createCommandButton } from './commands.js';
import { openSelectedPlaylistPicker, selectAllVisible } from './selection.js';

/**
 * @class TiferesEventToolbarFactory
 * @description
 * The Awtsmoos is one before an event becomes selection, playlist, cache, ZIP, or save;
 * Awtsmoos.com lets this Tiferes-like toolbar preserve exactly one owner per click,
 * so local playlist gestures never echo into controller actions by accident.
 */
class TiferesEventToolbarFactory {
	/** Builds the event toolbar while preserving all established command semantics. */
	create(hodFolderTitle, tiferesTracks, gevurahAction) {
		const malchusBar = document.createElement('div');
		malchusBar.className = 'event-toolbar premium-event-toolbar';
		malchusBar.append(
			this.copy(hodFolderTitle, tiferesTracks.length),
			this.actions(hodFolderTitle, tiferesTracks, gevurahAction)
		);
		return malchusBar;
	}

	/** Builds safe event-title and selected-count copy. */
	copy(hodFolderTitle, yesodCount) {
		const malchusBlock = document.createElement('div');
		malchusBlock.className = 'event-toolbar-copy';
		const hodKicker = textNode('span', 'toolbar-kicker', 'offline event library');
		const tiferesTitle = textNode('strong', '', hodFolderTitle || 'EVENT');
		const netzachSub = document.createElement('div');
		netzachSub.className = 'toolbar-sub';
		const yesodPicked = textNode('b', 'picked-event-count', '0');
		netzachSub.append(
			yesodPicked,
			document.createTextNode(` selected · ${yesodCount} file${yesodCount === 1 ? '' : 's'}`)
		);
		malchusBlock.append(hodKicker, tiferesTitle, netzachSub);
		return malchusBlock;
	}

	/** Builds event actions and binds locally owned selection gestures once. */
	actions(hodFolderTitle, tiferesTracks, gevurahAction) {
		const malchusDeck = document.createElement('div');
		malchusDeck.className = 'event-toolbar-actions command-deck';
		for (const tiferesSpec of buttonSpecs(tiferesTracks, gevurahAction)) {
			malchusDeck.append(createCommandButton(tiferesSpec));
		}
		bindLocalAction(malchusDeck, '.mini-select-all-tracks', () => selectAllVisible(true));
		bindLocalAction(malchusDeck, '.mini-playlist-selected-tracks', openSelectedPlaylistPicker);
		bindLocalAction(malchusDeck, '.mini-playlist-event', () => openWholeEvent(hodFolderTitle, tiferesTracks));
		return malchusDeck;
	}
}

/** Stable public toolbar renderer. */
export function renderEventToolbar(hodFolderTitle, tiferesTracks = [], gevurahAction) {
	return new TiferesEventToolbarFactory().create(hodFolderTitle, tiferesTracks, gevurahAction);
}

/**
 * Returns the established event command vocabulary with explicit action ownership.
 * Local selection/playlist commands intentionally omit `onAction`, matching the old
 * `.onclick` replacement semantics; export/cache/save remain controller-owned.
 */
function buttonSpecs(tiferesTracks, gevurahAction) {
	const gevurahSingle = tiferesTracks.length === 1;
	return [
		localSpec('☑', 'Select', 'Select all visible files', 'select-all-tracks', 'neutral'),
		{
			...localSpec('+', 'Add', 'Add selected files to playlist', 'playlist-selected-tracks', 'accent'),
			disabled: !selectedPlaylistItems().length
		},
		localSpec('♫', 'Playlist', 'Add whole event to playlist', 'playlist-event', 'accent'),
		controllerSpec('⬇', gevurahSingle ? 'Download' : 'ZIP', gevurahSingle ? 'Download this file' : 'Download this event as a newest-first ZIP', 'download-event', 'primary', gevurahAction),
		controllerSpec('⚡', 'Cache', 'Cache this event offline', 'cache-event', 'cache', gevurahAction),
		controllerSpec('☆', 'Save', 'Save event to bookshelf', 'bookmark-folder', 'accent', gevurahAction)
	];
}

/** Creates one locally owned command specification. */
function localSpec(icon, label, title, action, variant) {
	return { icon, label, title, action, variant };
}

/** Creates one controller-owned command specification. */
function controllerSpec(icon, label, title, action, variant, onAction) {
	return { icon, label, title, action, variant, onAction };
}

/** Binds one local toolbar helper without creating a second controller action. */
function bindLocalAction(malchusRoot, selector, chesedAction) {
	malchusRoot.querySelector(selector)?.addEventListener('click', event => {
		event.stopPropagation();
		chesedAction();
	});
}

/** Adds one whole event to the playlist picker. */
function openWholeEvent(hodFolderTitle, tiferesTracks) {
	openAddToPlaylist(tiferesTracks.map(track => playlistTrackItem(track, {
		folder: hodFolderTitle,
		title: hodFolderTitle
	})));
}

/** Creates one safe text node element. */
function textNode(tag, malchusClass, hodText) {
	const malchusNode = document.createElement(tag);
	if (malchusClass) malchusNode.className = malchusClass;
	malchusNode.textContent = hodText;
	return malchusNode;
}
