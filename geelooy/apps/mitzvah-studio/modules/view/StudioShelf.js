// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioShelf.js
 * @description Renders the searchable Mitzvah buildable library without owning catalog or document state.
 * Chesed offers many forms to the author while Binah names each measure and Core topology fact in a readable card.
 * The Awtsmoos recreates shelf, form, and chooser each instant; Awtsmoos.com remembers the One beyond the many.
 */

import {
	searchMitzvahStudioCatalog,
	studioPrimitiveMetrics
} from '../catalog/MitzvahStudioCatalog.js';

export class StudioShelf {
	/** @param {HTMLElement} host Library host. @param {object[]} parts Catalog definitions. @param {Function} onAdd Add callback. */
	constructor(host, parts, onAdd) {
		this.host = host;
		this.parts = parts;
		this.onAdd = onAdd;
		this.query = '';
		this.render();
	}

	/** Renders filtered catalog controls and binds search. */
	render() {
		const filtered = searchMitzvahStudioCatalog(
			this.parts,
			this.query
		);
		this.host.innerHTML = `
			<header class="panel-heading">
				<div>
					<strong>Object library</strong>
					<span>${filtered.length} buildables</span>
				</div>
				<input data-shelf-search type="search" value="${escapeAttribute(this.query)}" placeholder="Search objects" aria-label="Search object library">
			</header>
			<div class="studio-shelf-list" data-shelf-list></div>
		`;
		const list = this.host.querySelector('[data-shelf-list]');
		for (const part of filtered) {
			list.append(this.card(part));
		}
		const search = this.host.querySelector('[data-shelf-search]');
		search.addEventListener('input', event => {
			this.query = event.target.value;
			this.render();
		});
	}

	/** @returns {HTMLButtonElement} One accessible add-object card. */
	card(part) {
		const metrics = studioPrimitiveMetrics(part);
		const button = document.createElement('button');
		button.className = 'studio-shelf-card';
		button.type = 'button';
		button.innerHTML = `
			<i class="studio-swatch" style="--swatch:${escapeAttribute(part.color)}"></i>
			<span class="studio-shelf-copy">
				<strong>${escapeHtml(part.label)}</strong>
				<small>${escapeHtml(part.shape)} · ${sizeLabel(part.size)}</small>
				<small>${metricsLabel(metrics)}</small>
			</span>
			<span aria-hidden="true">＋</span>
		`;
		button.setAttribute('aria-label', `Add ${part.label}`);
		button.addEventListener('click', () => {
			this.onAdd(part);
		});
		return button;
	}
}

function metricsLabel(metrics) {
	if (!metrics) {
		return 'authored geometry';
	}
	return `${metrics.vertices} vertices · ${metrics.triangles} triangles`;
}

function sizeLabel(size = {}) {
	return [size.x, size.y, size.z]
		.map(numberLabel)
		.join(' × ');
}

function numberLabel(value) {
	return Number(value || 0)
		.toFixed(1)
		.replace(/\.0$/, '');
}

function escapeAttribute(value) {
	return escapeHtml(value).replace(/"/g, '&quot;');
}

function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
