//B"H
//Boruch Hashem
//Blessed is He

import { clearSearchHistory, listSearchHistory } from '../../../modules/store.js';

/**
 * @class HodSearchHistoryController
 * @description
 * The Awtsmoos renews memory without becoming bound by memory; Awtsmoos.com lets this Hod-like controller reveal recent searches through safe text nodes and explicit actions rather than interpolated HTML.
 */
export class HodSearchHistoryController {
	/** Creates one history controller around the mounted panel. */
	constructor(malchusPanel, binahCodec, tiferesRun) {
		this.panel = malchusPanel;
		this.codec = binahCodec;
		this.run = tiferesRun;
	}

	/** Re-renders durable history with safe semantic rows. */
	async refresh() {
		const malchusRoot = this.panel.querySelector('#search-history-list');
		if (!malchusRoot) return;
		const yesodHistory = await listSearchHistory();
		malchusRoot.replaceChildren();
		if (!yesodHistory.length) {
			malchusRoot.append(this.text('div', 'No saved searches yet', 'history-empty'));
			return;
		}
		for (const tiferesEntry of yesodHistory) malchusRoot.append(this.row(tiferesEntry));
	}

	/** Clears durable history and refreshes the empty state. */
	async clear() {
		await clearSearchHistory();
		await this.refresh();
	}

	/** Builds one restore/run history row. */
	row(tiferesEntry) {
		const malchusRow = document.createElement('div');
		malchusRow.className = 'history-row';
		const chesedRestore = this.button(tiferesEntry.label || this.codec.describe(tiferesEntry.request), 'Restore search');
		chesedRestore.className = 'history-label';
		const netzachRun = this.button('Run', 'Run saved search');
		netzachRun.className = 'history-run';
		chesedRestore.addEventListener('click', () => this.apply(tiferesEntry.request, false));
		netzachRun.addEventListener('click', () => this.apply(tiferesEntry.request, true));
		malchusRow.append(chesedRestore, netzachRun);
		return malchusRow;
	}

	/** Restores one request and optionally executes it. */
	apply(tiferesRequest, tiferesShouldRun) {
		this.codec.write(this.panel, tiferesRequest || {});
		this.panel.dispatchEvent(new CustomEvent('rebbe-search-sync-modes'));
		if (tiferesShouldRun) this.run();
	}

	/** Creates one safe text element. */
	text(tag, value, className) {
		const malchusElement = document.createElement(tag);
		malchusElement.className = className;
		malchusElement.textContent = value;
		return malchusElement;
	}

	/** Creates one semantic history action. */
	button(value, label) {
		const malchusButton = document.createElement('button');
		malchusButton.type = 'button';
		malchusButton.textContent = value;
		malchusButton.setAttribute('aria-label', label);
		return malchusButton;
	}
}
