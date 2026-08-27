// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioOutliner.js
 * @description Reveals every placed object as an accessible selectable row while canonical selection and removal remain in StudioDocumentState.
 * The Awtsmoos recreates every name and vessel each instant while remaining beyond their visible list;
 * Awtsmoos.com lets Malchus gather authored forms into one ordered witness without copying document truth into the mist.
 */

import { escapeStudioAttribute, escapeStudioHtml } from './StudioMarkupEscaping.js';

export class StudioOutliner {
	/**
	 * @description Creates an outliner view and installs one delegated click boundary for selection and removal.
	 * @param {HTMLElement} host Outliner host panel.
	 * @param {StudioDocumentState} state Shared canonical Studio state.
	 */
	constructor(host, state) {
		this.host = host;
		this.state = state;
		this.host.addEventListener('click', event => this.handleClick(event));
	}

	/**
	 * @description Replaces outliner markup from an immutable snapshot without creating any local document model.
	 * @param {object} snapshot Immutable Studio view snapshot containing document and selectedId.
	 * @returns {void} Mutates only outliner DOM.
	 */
	render(snapshot) {
		const objects = snapshot.document.objects;
		this.host.innerHTML = `
			<header class="panel-heading"><div><strong>World objects</strong><span>${objects.length} placed</span></div></header>
			<div class="studio-outliner-list">${objects.length ? outlinerRows(objects, snapshot.selectedId) : outlinerEmptyState()}</div>
		`;
	}

	/**
	 * @description Routes a delegated click to canonical selection or removal according to the nearest data-action element.
	 * @param {MouseEvent} event Click event originating within the Outliner host.
	 * @returns {void} May mutate shared Studio state through select or remove.
	 */
	handleClick(event) {
		const selectButton = event.target.closest('[data-select-id]');
		if (selectButton) {
			this.state.select(selectButton.dataset.selectId);
			return;
		}
		const removeButton = event.target.closest('[data-remove-id]');
		if (removeButton) {
			this.state.remove(removeButton.dataset.removeId);
		}
	}
}

/**
 * @description Renders all object rows in canonical document order.
 * @param {object[]} objects Canonical placed-object records.
 * @param {string|null} selectedId Current selected object identity.
 * @returns {string} Safe HTML for every outliner row.
 */
function outlinerRows(objects, selectedId) {
	return objects
		.map(object => outlinerRow(object, selectedId))
		.join('');
}

/**
 * @description Renders one selectable/removable object row with explicit selection evidence and escaped semantic identity.
 * @param {object} object Canonical placed-object record.
 * @param {string|null} selectedId Current selected object identity.
 * @returns {string} Safe HTML for one outliner row.
 */
function outlinerRow(object, selectedId) {
	const selected = object.id === selectedId;
	return `<div class="studio-outliner-row" data-selected="${selected}">
		<button type="button" data-select-id="${escapeStudioAttribute(object.id)}" aria-pressed="${selected}">
		<i class="studio-swatch" style="--swatch:${escapeStudioAttribute(object.color)}"></i><span>
		<strong>${escapeStudioHtml(object.label)}</strong><small>${escapeStudioHtml(object.id)}</small></span></button>
		<button class="icon-button danger" type="button" data-remove-id="${escapeStudioAttribute(object.id)}" aria-label="Delete ${escapeStudioAttribute(object.label)}">×</button></div>`;
}

/**
 * @description Renders the instructional empty state when no world object exists.
 * @returns {string} Static safe empty-state markup.
 */
function outlinerEmptyState() {
	return '<p class="empty-state">Add an object from the library to begin shaping the world.</p>';
}
