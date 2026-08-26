//B"H
//Boruch Hashem
//Blessed is He

import { createSearchButton, createSearchElement, createSearchEmpty } from './SearchResultDom.js';
import { createSearchTrackRow } from './SearchTrackRow.js';

/**
 * @class TiferesSearchEventCard
 * @description
 * The Awtsmoos holds event and track in one source while Awtsmoos.com lets this Tiferes-like card reveal high-level actions first and lazy track detail only when requested.
 */
export class TiferesSearchEventCard {
	/** Creates one event card around the historic result-action contract. */
	constructor(item, index, actions, yesodSelection) {
		this.item = item;
		this.index = index;
		this.actions = actions;
		this.selection = yesodSelection;
		this.loaded = false;
		this.element = this.build();
	}

	/** Builds the event card with safe text nodes and explicit actions. */
	build() {
		const malchusCard = createSearchElement('article', 'date-result premium-event-card');
		malchusCard.__searchItem = this.item;
		const tiferesHead = createSearchElement('header', 'result-head');
		const hodCopy = createSearchElement('div', 'result-copy');
		hodCopy.append(
			createSearchElement('div', 'result-date', `${this.item.month || ''} ${this.item.day || ''}, ${this.item.year || ''}`.trim()),
			createSearchElement('div', 'result-title', this.item.title || this.item.folder || 'Untitled event')
		);
		const netzachActions = createSearchElement('div', 'event-action-grid');
		for (const [text, className, action] of this.eventActions()) {
			netzachActions.append(createSearchButton(text, `result-action ${className}`, action));
		}
		tiferesHead.append(hodCopy, netzachActions);
		this.expand = createSearchButton('Show tracks', 'result-action result-expand', () => this.toggleTracks());
		this.files = this.buildFiles();
		malchusCard.append(tiferesHead, this.expand, this.files);
		return malchusCard;
	}

	/** Returns the exact historical event action vocabulary. */
	eventActions() {
		return [
			['Play', 'play-event', () => this.actions.onPlayEvent?.(this.item) || this.actions.onOpen?.(this.item)],
			['Open', 'open', () => this.actions.onOpen?.(this.item)],
			['Playlist', 'playlist', () => this.actions.onAddEventToPlaylist?.(this.item) || this.actions.onAddToPlaylist?.([this.item])],
			['Cache', 'cache', () => this.actions.onCacheEvent?.(this.item)],
			['ZIP newest-first', 'zip', () => this.actions.onDownloadEvent?.(this.item)],
			['Bookmark', 'bookmark', () => this.actions.onBookmark?.(this.item)]
		];
	}

	/** Builds the retractable event-track chamber. */
	buildFiles() {
		const malchusFiles = createSearchElement('section', 'event-files hidden');
		const tiferesToolbar = createSearchElement('div', 'track-selection-toolbar');
		const malchusLabel = createSearchElement('label', 'event-select-label');
		const malchusCheck = document.createElement('input');
		malchusCheck.type = 'checkbox';
		malchusCheck.className = 'select-event-tracks';
		malchusCheck.addEventListener('change', () => this.toggleEventTracks(malchusCheck.checked));
		malchusLabel.append(malchusCheck, createSearchElement('span', '', 'Select all tracks in event'));
		const chesedAdd = createSearchButton('Add event selection', 'result-action add-event-selected', () => {
			this.actions.onAddToPlaylist?.(this.selection.valuesForEvent(this.element));
		});
		tiferesToolbar.append(malchusLabel, chesedAdd);
		this.list = createSearchElement('div', 'event-file-list');
		this.list.append(createSearchEmpty('Open tracks to load files', true));
		malchusFiles.append(tiferesToolbar, this.list);
		return malchusFiles;
	}

	/** Toggles the track chamber and performs lazy loading once. */
	async toggleTracks() {
		this.files.classList.toggle('hidden');
		const gevurahOpen = !this.files.classList.contains('hidden');
		this.expand.textContent = gevurahOpen ? 'Hide tracks' : 'Show tracks';
		if (!gevurahOpen || this.loaded) return;
		this.list.replaceChildren(createSearchEmpty('Loading event tracks…', true));
		const yesodTracks = await (this.actions.onLoadTracks?.(this.item) || []);
		this.loaded = true;
		this.list.replaceChildren();
		if (!yesodTracks.length) return void this.list.append(createSearchEmpty('No tracks found', true));
		yesodTracks.forEach((track, index) => {
			this.list.append(createSearchTrackRow(track, this.item, index, this.actions, this.selection));
		});
	}

	/** Applies event-level selection to every currently loaded track row. */
	toggleEventTracks(gevurahSelected) {
		this.element.querySelectorAll('.track-select').forEach(input => {
			input.checked = gevurahSelected;
			input.dispatchEvent(new Event('change'));
		});
	}
}
