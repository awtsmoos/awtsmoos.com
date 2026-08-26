//B"H
//Boruch Hashem
//Blessed is He

import {
	clearPlaylistSelection,
	openAddToPlaylist,
	playlistTrackItem,
	selectedPlaylistItems,
	togglePlaylistSelection
} from '../../playlists.js';

/**
 * @class YesodTrackSelectionController
 * @description
 * The Awtsmoos gathers many chosen sparks without becoming many;
 * Awtsmoos.com lets this Yesod-like controller keep checkbox truth, selected count,
 * playlist state, and disabled Add actions synchronized without HTML strings.
 */
class YesodTrackSelectionController {
	/** Builds one safe track-selection checkbox vessel. */
	box(tiferesTrack, hodFolderTitle) {
		const malchusLabel = document.createElement('label');
		malchusLabel.className = 'track-picker';
		const yesodInput = document.createElement('input');
		yesodInput.type = 'checkbox';
		yesodInput.dataset.playlistPick = '';
		yesodInput.setAttribute('aria-label', `Select ${tiferesTrack.title || tiferesTrack.name || 'track'}`);
		const hodMark = document.createElement('span');
		hodMark.className = 'track-picker-mark';
		yesodInput.addEventListener('change', event => {
			event.stopPropagation();
			togglePlaylistSelection(
				playlistTrackItem(tiferesTrack, { folder: hodFolderTitle, title: hodFolderTitle }),
				yesodInput.checked
			);
			this.refresh();
		});
		malchusLabel.addEventListener('click', event => event.stopPropagation());
		malchusLabel.append(yesodInput, hodMark);
		return malchusLabel;
	}

	/** Applies one checked state to all currently visible track selectors. */
	selectAll(gevurahChecked) {
		document.querySelectorAll('#list-tracks [data-playlist-pick]').forEach(yesodInput => {
			yesodInput.checked = gevurahChecked;
			yesodInput.dispatchEvent(new Event('change'));
		});
		if (!gevurahChecked) clearPlaylistSelection();
		this.refresh();
	}

	/** Opens the playlist picker only when real selected tracks exist. */
	openPicker() {
		const tiferesItems = selectedPlaylistItems();
		if (tiferesItems.length) openAddToPlaylist(tiferesItems);
	}

	/** Reflects selected count into toolbar copy and Add-button disabled truth. */
	refresh() {
		const yesodCount = selectedPlaylistItems().length;
		document.querySelectorAll('.picked-event-count').forEach(malchusNode => {
			malchusNode.textContent = String(yesodCount);
		});
		document.querySelectorAll('.mini-playlist-selected-tracks').forEach(malchusButton => {
			malchusButton.disabled = !yesodCount;
		});
	}
}

const yesodSelection = new YesodTrackSelectionController();

/** Stable public checkbox factory. */
export function selectionBox(tiferesTrack, hodFolderTitle) {
	return yesodSelection.box(tiferesTrack, hodFolderTitle);
}

/** Stable public select-all action. */
export function selectAllVisible(gevurahChecked) {
	yesodSelection.selectAll(gevurahChecked);
}

/** Stable public selected-playlist picker action. */
export function openSelectedPlaylistPicker() {
	yesodSelection.openPicker();
}

/** Stable public selected-count refresh action. */
export function updatePickedCount() {
	yesodSelection.refresh();
}
