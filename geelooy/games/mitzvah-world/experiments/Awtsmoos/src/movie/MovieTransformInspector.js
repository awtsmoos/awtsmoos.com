// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTransformInspector.js
 * @description Edits timing, easing, and transform channels as one reversible clip transaction.
 * The Awtsmoos renews motion beyond numeric coordinates; Awtsmoos.com remembers the
 * departing clip before finite values change, so inspector edits enter the same honest history.
 */

import {
	movieClipTransformPaths,
	readMovieClipNumber,
	writeMovieClipNumber
} from './MovieClipTransform.js';
import { movieSelectionDescriptor } from './MovieProjectSelection.js';

const EASINGS = Object.freeze([
	'linear',
	'smoothstep',
	'smootherstep',
	'easeInOutQuad',
	'easeInOutCubic'
]);

export class MovieTransformInspector {
	constructor(host, onChange) {
		this.host = host;
		this.onChange = onChange;
		this.selection = null;
		this.renderEmpty();
	}

	select(selection) {
		this.selection = selection;
		this.render();
	}

	renderEmpty() {
		this.host.innerHTML = `
			<div class="movie-transform-empty">
				Select a camera or actor clip to edit 3D transforms.
			</div>
		`;
	}

	render() {
		if (!this.selection) return this.renderEmpty();
		const { clip, track } = this.selection;
		const paths = movieClipTransformPaths(track, clip);
		this.host.innerHTML = `
			<header><b>${escapeHtml(track.type)} · ${escapeHtml(clip.id)}</b></header>
			<div class="movie-transform-grid">
				${numberInput('start', 'Start', clip.start)}
				${numberInput('duration', 'Duration', clip.duration)}
				<label>Easing<select data-easing>${EASINGS.map(value => (
					`<option ${value === clip.easing ? 'selected' : ''}>${value}</option>`
				)).join('')}</select></label>
				${paths.map(item => numberInput(
					item.path,
					item.label,
					readMovieClipNumber(clip, item.path)
				)).join('')}
			</div>
			<button data-apply-transform>Apply transform</button>
		`;
		this.host.querySelector('[data-apply-transform]').addEventListener(
			'click',
			() => this.apply()
		);
	}

	apply() {
		if (!this.selection) return null;
		const { clip, track } = this.selection;
		const original = structuredClone(clip);
		for (const input of this.host.querySelectorAll('[data-path]')) {
			applyMovieTransformInput(clip, input);
		}
		clip.easing = this.host.querySelector('[data-easing]').value;
		const value = {
			clip,
			descriptor: this.selection.descriptor
				|| movieSelectionDescriptor(track, clip),
			original,
			track
		};
		this.onChange?.(value);
		this.render();
		return value;
	}
}

function applyMovieTransformInput(clip, input) {
	if (input.dataset.path === 'start') {
		clip.start = Math.max(0, Number(input.value || 0));
		return;
	}
	if (input.dataset.path === 'duration') {
		clip.duration = Math.max(0.001, Number(input.value || 0.001));
		return;
	}
	writeMovieClipNumber(clip, input.dataset.path, input.value);
}

function numberInput(path, label, value) {
	return `
		<label>${escapeHtml(label)}
			<input type="number" step="0.1" value="${Number(value || 0)}" data-path="${escapeHtml(path)}">
		</label>
	`;
}

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}
