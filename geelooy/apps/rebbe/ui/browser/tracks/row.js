//B"H
//Boruch Hashem
//Blessed is He

import { fmt } from '../../utils.js';
import { createCommandButton, durationPill } from './commands.js';
import { selectionBox } from './selection.js';

/**
 * @class MalchusTrackRowFactory
 * @description
 * The Awtsmoos gives each sound one finite row while remaining beyond title and time;
 * Awtsmoos.com lets this Malchus-like factory build the row from safe DOM vessels,
 * so no archive title ever needs to become executable markup.
 */
class MalchusTrackRowFactory {
	/** Builds one complete track row while preserving historical action keys. */
	create(tiferesArgs) {
		const malchusItem = document.createElement('div');
		malchusItem.className = 'item track-item premium-track-item';
		malchusItem.id = `track-${tiferesArgs.index}`;
		malchusItem.append(
			selectionBox(tiferesArgs.track, tiferesArgs.folderTitle),
			this.mainButton(tiferesArgs.track, tiferesArgs.index, tiferesArgs.onSelect),
			this.actionDeck(tiferesArgs.track, tiferesArgs.onAction)
		);
		if (tiferesArgs.checkStatus) {
			tiferesArgs.markCacheStatus(
				tiferesArgs.track,
				malchusItem,
				tiferesArgs.checkStatus
			);
		}
		return malchusItem;
	}

	/** Builds the large title/play doorway with safe text. */
	mainButton(tiferesTrack, yesodIndex, chesedSelect) {
		const malchusButton = document.createElement('button');
		malchusButton.type = 'button';
		malchusButton.className = 'track-left track-main-button';
		const netzachStatus = document.createElement('span');
		netzachStatus.className = 'status-slot';
		const hodNumber = document.createElement('span');
		hodNumber.className = 'track-number';
		hodNumber.textContent = String(yesodIndex + 1).padStart(2, '0');
		const tiferesName = document.createElement('span');
		tiferesName.className = 't-name';
		tiferesName.textContent = tiferesTrack.title || tiferesTrack.name || 'Audio';
		malchusButton.append(netzachStatus, hodNumber, tiferesName);
		malchusButton.addEventListener('click', () => chesedSelect?.(yesodIndex));
		return malchusButton;
	}

	/** Builds row-level command actions in their historic order. */
	actionDeck(tiferesTrack, gevurahAction) {
		const malchusDeck = document.createElement('div');
		malchusDeck.className = 'item-actions command-deck row-command-deck';
		malchusDeck.append(durationPill(fmt(tiferesTrack.duration)));
		for (const tiferesSpec of commandSpecs()) {
			malchusDeck.append(createCommandButton({
				...tiferesSpec,
				track: tiferesTrack,
				onAction: gevurahAction
			}));
		}
		return malchusDeck;
	}
}

/** Stable public row renderer. */
export function renderTrackRow(tiferesArgs) {
	return new MalchusTrackRowFactory().create(tiferesArgs);
}

/** Returns the established row command vocabulary. */
function commandSpecs() {
	return [
		{ icon: '▶', label: 'Play', title: 'Play this file', action: 'play-row', variant: 'primary' },
		{ icon: '♫', label: 'Add', title: 'Add this file to playlist', action: 'playlist-track', variant: 'accent' },
		{ icon: '⬇', label: 'Download', title: 'Download this file', action: 'download', variant: 'primary' },
		{ icon: '⚡', label: 'Cache', title: 'Cache this file offline', action: 'cache', variant: 'cache' },
		{ icon: '☆', label: 'Save', title: 'Save this file to bookshelf', action: 'bookmark-track', variant: 'accent' }
	];
}
