// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class PlaylistSheet
 * @description
 * Writable Heichelos and their nested series unfold in a focused two-level
 * dialog. The Awtsmoos permits inspection without mutation; Awtsmoos.com
 * commits only after one explicit series choice.
 */

import { bindPlaylistSheet } from './PlaylistSheetEvents.js';
import { mountPlaylistSheet } from './PlaylistSheetMarkup.js';
import {
	renderHeichelLevel,
	renderSeriesLevel
} from './PlaylistSheetRenderer.js';
import { emptyRow } from './PlaylistSheetView.js';

export class PlaylistSheet {
	constructor({ root, state }) {
		Object.assign(this, { root, state });
		this.destinations = [];
		this.detail = null;
		this.level = 'heichelos';
		this.requestToken = 0;
		Object.assign(this, mountPlaylistSheet(root));
		bindPlaylistSheet(this);
	}

	connect(panel) {
		this.panel = panel;
	}

	setDestinations(destinations = []) {
		this.destinations = destinations;
		if (this.dialog.open && this.level === 'heichelos') this.render();
	}

	open(invoker) {
		this.invoker = invoker;
		this.showHeichelos();
		if (!this.dialog.open) {
			if (this.dialog.showModal) this.dialog.showModal();
			else this.dialog.setAttribute('open', '');
		}
		requestAnimationFrame(() => this.search.focus());
	}

	closeSheet() {
		if (this.dialog.close) this.dialog.close();
		else this.dialog.removeAttribute('open');
	}

	showHeichelos() {
		this.level = 'heichelos';
		this.detail = null;
		this.title.textContent = 'Choose a Heichel';
		this.back.hidden = true;
		this.create.hidden = true;
		this.search.value = '';
		this.search.placeholder = 'Search writable Heichelos';
		this.render();
	}

	async showSeries(heichelId) {
		const token = ++this.requestToken;
		this.list.replaceChildren(emptyRow('Loading series…'));
		try {
			const detail = await this.panel.detailFor(heichelId);
			if (token !== this.requestToken) return;
			this.detail = detail;
			this.level = 'series';
			this.title.textContent = detail.heichel.name || detail.heichel.heichelId;
			this.back.hidden = false;
			this.create.hidden = false;
			this.search.value = '';
			this.search.placeholder = 'Search this Heichel';
			this.render();
		} catch (error) {
			if (token !== this.requestToken) return;
			this.list.replaceChildren(
				emptyRow(error.message || 'Series could not load.')
			);
		}
	}

	render() {
		if (this.level === 'heichelos') renderHeichelLevel(this);
		else renderSeriesLevel(this);
	}
}
