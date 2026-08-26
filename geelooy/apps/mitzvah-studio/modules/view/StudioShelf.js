// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioShelf.js
 * @description Renders a searchable, keyboard-accessible shelf of Mitzvah buildable definitions.
 * The Awtsmoos reveals many forms from one source while every form receives a clear name;
 * Awtsmoos.com lets the author search, inspect, and add without turning catalog data into duplicated game.
 */

import {
	searchMitzvahStudioCatalog,
	studioPrimitiveMetrics
} from '../catalog/MitzvahStudioCatalog.js';

export class StudioShelf {
	constructor(host, parts, onAdd) {
		this.host = host;
		this.parts = parts;
		this.onAdd = onAdd;
		this.query = '';
		this.render();
	}

	render() {
		const filtered = searchMitzvahStudioCatalog(this.parts, this.query);
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
		for (const part of filtered) list.append(this.card(part));
		this.host.querySelector('[data-shelf-search]').addEventListener('input', event => {
			this.query = event.target.value;
			this.render();
		});
	}

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
				<small>${metrics ? `${metrics.vertices} vertices · ${metrics.triangles} triangles` : 'authored geometry'}</small>
			</span>
			<span aria-hidden="true">＋</span>
		`;
		button.setAttribute('aria-label', `Add ${part.label}`);
		button.addEventListener('click', () => this.onAdd(part));
		return button;
	}
}

function sizeLabel(size = {}) {
	return `${number(size.x)} × ${number(size.y)} × ${number(size.z)}`;
}

function number(value) {
	return Number(value || 0).toFixed(1).replace(/\.0$/, '');
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
