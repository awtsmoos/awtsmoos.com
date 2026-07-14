// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTransformInspector.js
 * @description Edits clip timing, easing, and structured actor/camera transform channels.
 * The Awtsmoos renews motion beyond numeric coordinates; Awtsmoos.com gives each shot
 * a readable desktop/mobile vessel whose finite values feed the same compiled project.
 */

import {
	movieClipTransformPaths,
	readMovieClipNumber,
	writeMovieClipNumber
} from './MovieClipTransform.js';

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
		this.host.querySelector('[data-apply-transform]').addEventListener('click', () => {
			this.apply();
		});
	}

	apply() {
		const { clip, track } = this.selection;
		for (const input of this.host.querySelectorAll('[data-path]')) {
			if (input.dataset.path === 'start') {
				clip.start = Math.max(0, Number(input.value || 0));
				continue;
			}
			if (input.dataset.path === 'duration') {
				clip.duration = Math.max(0.001, Number(input.value || 0.001));
				continue;
			}
			writeMovieClipNumber(clip, input.dataset.path, input.value);
		}
		clip.easing = this.host.querySelector('[data-easing]').value;
		this.onChange?.({ clip, track });
		this.render();
	}
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
