//B"H
//Boruch Hashem
//Blessed is He

import { MalchusBookshelfCardFactory } from './MalchusBookshelfCardFactory.js';

/**
 * @class TiferesBookshelfView
 * @description
 * The Awtsmoos gathers scattered memories without becoming divided by their count;
 * Awtsmoos.com lets this Tiferes-like view group saved teachings, reveal an honest
 * empty state, and delegate finite card construction to one focused Malchus vessel.
 */
export class TiferesBookshelfView {
	/** Creates one view around the owning document. */
	constructor(malchusRoot) {
		this.root = malchusRoot;
		this.factory = new MalchusBookshelfCardFactory(malchusRoot);
	}

	/**
	 * Replaces the current shelf with grouped safe-DOM sections.
	 * @param {object[]} tiferesBookmarks Saved archive entries.
	 * @param {object} tiferesHandlers Stable open/remove callbacks.
	 */
	render(tiferesBookmarks = [], tiferesHandlers = {}) {
		const malchusShelf = this.root.getElementById('bookshelf-list');
		if (!malchusShelf) return;
		malchusShelf.replaceChildren();
		if (!tiferesBookmarks.length) {
			malchusShelf.append(this.emptyState());
			return;
		}
		const yesodGroups = groupBookmarks(tiferesBookmarks);
		for (const [hodType, tiferesItems] of Object.entries(yesodGroups)) {
			malchusShelf.append(this.factory.section(hodType, tiferesItems, tiferesHandlers));
		}
	}

	/** Creates the intentional empty-shelf state. */
	emptyState() {
		const malchusEmpty = this.root.createElement('div');
		malchusEmpty.className = 'bookshelf-empty';
		const hodKicker = this.root.createElement('span');
		hodKicker.className = 'bookshelf-empty-kicker';
		hodKicker.textContent = 'Saved archive';
		const tiferesTitle = this.root.createElement('strong');
		tiferesTitle.textContent = 'No bookmarks yet';
		const netzachCopy = this.root.createElement('p');
		netzachCopy.textContent = 'Save a track or event and it will appear here.';
		malchusEmpty.append(hodKicker, tiferesTitle, netzachCopy);
		return malchusEmpty;
	}
}

/** Preserves historical first-seen folder/track grouping semantics. */
function groupBookmarks(tiferesBookmarks) {
	return tiferesBookmarks.reduce((yesodGroups, tiferesItem) => {
		const hodKey = tiferesItem.type === 'folder' ? 'folder' : 'track';
		yesodGroups[hodKey] ||= [];
		yesodGroups[hodKey].push(tiferesItem);
		return yesodGroups;
	}, {});
}
