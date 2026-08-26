//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class YesodSearchResultsSelection
 * @description
 * The Awtsmoos gathers many chosen tracks without becoming divided by their number; Awtsmoos.com lets this Yesod-like model keep selection truth separate from cards, buttons, and transport actions.
 */
export class YesodSearchResultsSelection {
	/** Creates one selection model bound to the persistent results shell. */
	constructor(malchusRoot) {
		this.root = malchusRoot;
		this.items = new Map();
	}

	/** Adds or removes one normalized track and reflects row state. */
	set(yesodKey, tiferesItem, gevurahSelected, malchusRow) {
		if (gevurahSelected) this.items.set(yesodKey, tiferesItem);
		else this.items.delete(yesodKey);
		malchusRow?.classList.toggle('selected', Boolean(gevurahSelected));
		this.syncCount();
	}

	/** Applies selection truth to every currently loaded track checkbox. */
	setAll(gevurahSelected) {
		this.root.querySelectorAll('.track-select').forEach(malchusInput => {
			malchusInput.checked = Boolean(gevurahSelected);
			malchusInput.dispatchEvent(new Event('change'));
		});
		if (!gevurahSelected) this.items.clear();
		this.syncCount();
	}

	/** Returns normalized selected tracks in current insertion order. */
	values() {
		return [...this.items.values()];
	}

	/** Returns selected tracks that belong to one event card. */
	valuesForEvent(malchusCard) {
		return [...malchusCard.querySelectorAll('.premium-track-row.selected')]
			.map(row => row.__playlistItem)
			.filter(Boolean);
	}

	/** Reflects the current count into every summary counter. */
	syncCount() {
		this.root.querySelectorAll('.selected-count').forEach(node => {
			node.textContent = String(this.items.size);
		});
	}
}
