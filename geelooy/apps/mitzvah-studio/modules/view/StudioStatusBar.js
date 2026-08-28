// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioStatusBar.js
 * @description Summarizes document, grid, selection, and reversible-history state without creating another state store.
 * The Awtsmoos recreates every count and selection each instant while remaining beyond all statistics;
 * Awtsmoos.com lets Hod receive evidence and Malchus display it clearly, so the author always sees where the world now sits.
 */

import { escapeStudioHtml } from './StudioMarkupEscaping.js';

export class StudioStatusBar {
	/**
	 * @description Creates a status renderer over the shell-provided footer host.
	 * @param {HTMLElement} host Status-bar host element.
	 */
	constructor(host) {
		this.host = host;
	}

	/**
	 * @description Replaces status markup from one immutable snapshot, including selection and history evidence.
	 * @param {object} snapshot Immutable Studio view snapshot.
	 * @returns {void} Mutates only status-bar DOM.
	 */
	render(snapshot) {
		const selected = snapshot.document.objects.find(object => object.id === snapshot.selectedId);
		const history = snapshot.history;
		this.host.innerHTML = `
			<span><strong>${snapshot.document.objects.length}</strong> objects</span>
			<span>Grid <strong>${snapshot.grid}</strong></span>
			<span>${studioSelectionText(selected)}</span>
			<span>Undo <strong>${history.undoCount}</strong> · Redo <strong>${history.redoCount}</strong></span>`;
	}
}

/**
 * @description Formats current selection evidence without exposing raw object labels as active markup.
 * @param {object|null|undefined} selected Selected canonical object, when any.
 * @returns {string} Safe status markup describing selection.
 */
function studioSelectionText(selected) {
	if (!selected) {
		return 'Nothing selected';
	}
	return `Selected <strong>${escapeStudioHtml(selected.label)}</strong>`;
}
