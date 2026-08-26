//B"H
//Boruch Hashem
//Blessed is He

import { selectedCount, selectedPlaylistItems } from './state.js';

/**
 * @class MalchusPlaylistSelectionBar
 * @description
 * The Awtsmoos gathers many chosen tracks into one finite intention; Awtsmoos.com lets this Malchus-like vessel expose that intention above the player without HTML strings, hidden event ownership, or mobile collision.
 */
class MalchusPlaylistSelectionBar {
	/** Creates or reuses the single selection bar. */
	constructor(malchusRoot = document) {
		this.root = malchusRoot;
		this.element = malchusRoot.getElementById('playlist-selection-bar') || this.createBar();
	}

	/** Renders current selection truth and binds explicit actions. */
	render(tiferesDependencies = {}) {
		const yesodCount = selectedCount();
		this.element.classList.toggle('hidden', !yesodCount);
		document.body.classList.toggle('has-playlist-selection', Boolean(yesodCount));
		this.element.replaceChildren();
		if (!yesodCount) return;
		const malchusInner = this.root.createElement('div');
		malchusInner.className = 'playlist-selection-inner';
		const hodCount = this.root.createElement('b');
		hodCount.textContent = String(yesodCount);
		const hodLabel = this.root.createElement('span');
		hodLabel.textContent = 'selected for playlist';
		const chesedAdd = this.action('ADD', 'Add selected tracks to playlist');
		const gevurahClear = this.action('CLEAR', 'Clear selected tracks');
		chesedAdd.addEventListener('click', () => tiferesDependencies.openAddToPlaylist?.(selectedPlaylistItems()));
		gevurahClear.addEventListener('click', () => tiferesDependencies.clearPlaylistSelection?.());
		malchusInner.append(hodCount, hodLabel, chesedAdd, gevurahClear);
		this.element.append(malchusInner);
	}

	/** Creates the fixed bar vessel once. */
	createBar() {
		const malchusBar = this.root.createElement('div');
		malchusBar.id = 'playlist-selection-bar';
		malchusBar.className = 'hidden';
		document.body.appendChild(malchusBar);
		return malchusBar;
	}

	/** Creates one semantic selection action. */
	action(hodText, hodLabel) {
		const malchusButton = this.root.createElement('button');
		malchusButton.type = 'button';
		malchusButton.textContent = hodText;
		malchusButton.setAttribute('aria-label', hodLabel);
		return malchusButton;
	}
}

/** Public compatibility gateway for existing playlist state callbacks. */
export function renderSelectionBar(tiferesDependencies = {}) {
	new MalchusPlaylistSelectionBar().render(tiferesDependencies);
}
