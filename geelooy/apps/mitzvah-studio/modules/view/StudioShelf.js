// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioShelf.js
 * @description Renders the searchable buildable library while catalog search, formatting, escaping, and document mutation remain separate authorities.
 * The Awtsmoos recreates shelf, form, and chooser each instant while no finite catalog contains the One;
 * Awtsmoos.com lets a clean library surface reveal measured geometry without hiding formatting or mutation beneath the sun.
 */

import { searchMitzvahStudioCatalog, studioPrimitiveMetrics } from '../catalog/MitzvahStudioCatalog.js';
import { escapeStudioAttribute, escapeStudioHtml } from './StudioMarkupEscaping.js';
import { studioShelfMetricsLabel, studioShelfSizeLabel } from './StudioShelfFormatting.js';

export class StudioShelf {
	/**
	 * @description Creates a searchable library view over immutable catalog definitions and one add-object callback.
	 * @param {HTMLElement} host Shelf host panel.
	 * @param {object[]} parts Catalog definitions available to the author.
	 * @param {Function} onAdd Callback invoked with the selected catalog definition.
	 */
	constructor(host, parts, onAdd) {
		this.host = host;
		this.parts = parts;
		this.onAdd = onAdd;
		this.query = '';
		this.render();
	}

	/**
	 * @description Filters the catalog by the current query, replaces library markup, and binds the search control.
	 * @returns {void} Mutates only Shelf DOM and local query state.
	 */
	render() {
		const filtered = searchMitzvahStudioCatalog(this.parts, this.query);
		this.host.innerHTML = `
			<header class="panel-heading"><div><strong>Object library</strong><span>${filtered.length} buildables</span></div>
			<input data-shelf-search type="search" value="${escapeStudioAttribute(this.query)}" placeholder="Search objects" aria-label="Search object library"></header>
			<div class="studio-shelf-list" data-shelf-list></div>
		`;
		const list = this.host.querySelector('[data-shelf-list]');
		for (const part of filtered) {
			list.append(this.card(part));
		}
		this.host.querySelector('[data-shelf-search]').addEventListener('input', event => {
			this.query = event.target.value;
			this.render();
		});
	}

	/**
	 * @description Creates one accessible add-object card with safe semantic labels, color evidence, dimensions, and geometry metrics.
	 * @param {object} part Catalog definition represented by the card.
	 * @returns {HTMLButtonElement} Unattached button whose click delegates the selected definition to onAdd.
	 */
	card(part) {
		const metrics = studioPrimitiveMetrics(part);
		const button = document.createElement('button');
		button.className = 'studio-shelf-card';
		button.type = 'button';
		button.innerHTML = `
			<i class="studio-swatch" style="--swatch:${escapeStudioAttribute(part.color)}"></i>
			<span class="studio-shelf-copy"><strong>${escapeStudioHtml(part.label)}</strong>
			<small>${escapeStudioHtml(part.shape)} · ${studioShelfSizeLabel(part.size)}</small>
			<small>${studioShelfMetricsLabel(metrics)}</small></span><span aria-hidden="true">＋</span>
		`;
		button.setAttribute('aria-label', `Add ${part.label}`);
		button.addEventListener('click', () => {
			this.onAdd(part);
		});
		return button;
	}
}
