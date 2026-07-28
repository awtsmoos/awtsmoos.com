// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class PlaylistSelector
 * @description
 * The canonical Heichel and series appear as one compact summary. The Awtsmoos
 * gives the post one birthplace while Awtsmoos.com opens all alternate writable
 * destinations in a focused sheet instead of crowding the writing page.
 */

import { isWritable } from './DefaultDestinationResolver.js';
import { writableSelection } from './PlaylistChoiceView.js';
import { PlaylistSheet } from './PlaylistSheet.js';

export class PlaylistSelector {
	constructor({ root, state, memory }) {
		Object.assign(this, { root, state, memory });
		this.sheet = new PlaylistSheet({ root, state });
		this.mount();
	}

	connect(panel) {
		this.panel = panel;
		this.sheet.connect(panel);
	}

	setDestinations(destinations = []) {
		this.sheet.setDestinations(destinations.filter(isWritable));
		this.render(this.state.snapshot());
	}

	setDetail() {
		this.render(this.state.snapshot());
	}

	render(snapshot) {
		const identity = snapshot.identity;
		const chosen = Boolean(identity.heichelId);
		this.name.textContent = chosen
			? `${identity.heichelName || identity.heichelId} › ${identity.seriesName || seriesLabel(identity.seriesId)}`
			: 'Choose a publishing playlist';
		this.note.textContent = chosen
			? 'This post will be added to this Heichel and series.'
			: 'An owned writable Heichel will be selected when available.';
		this.badge.hidden = !this.memory.matches(identity.aliasId, identity);
		this.defaultButton.disabled = !writableSelection(identity);
	}

	mount() {
		this.element = document.createElement('section');
		this.element.className = 'composer-playlist-selector';
		this.element.innerHTML = /*html*/`
			<div class="playlist-heading"><span aria-hidden="true">▤</span><div><small>Series playlist</small><strong data-playlist-name></strong><p data-playlist-note></p></div><b data-playlist-default hidden>Default</b></div>
			<div class="playlist-actions"><button type="button" data-playlist-change>Change series</button><button type="button" data-playlist-default-action>Make default</button><button type="button" data-playlist-browse>Browse all</button></div>
		`;
		this.name = this.element.querySelector('[data-playlist-name]');
		this.note = this.element.querySelector('[data-playlist-note]');
		this.badge = this.element.querySelector('[data-playlist-default]');
		this.defaultButton = this.element.querySelector('[data-playlist-default-action]');
		this.bind();
		this.root.querySelector('.contentPanel .majorPanelBody')?.prepend(this.element);
	}

	bind() {
		const changeButton = this.element.querySelector('[data-playlist-change]');
		changeButton.addEventListener('click', () => this.sheet.open(changeButton));
		this.element.querySelector('[data-playlist-browse]').addEventListener('click', () => {
			this.panel?.reveal();
		});
		this.defaultButton.addEventListener('click', () => this.remember());
	}

	remember() {
		const identity = this.state.snapshot().identity;
		if (!writableSelection(identity)) return;
		this.memory.save(identity.aliasId, identity);
		this.render(this.state.snapshot());
	}
}

function seriesLabel(seriesId) {
	return seriesId === 'root' ? 'Heichel Home' : seriesId || 'Series';
}
