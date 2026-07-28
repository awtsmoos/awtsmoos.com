// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleTimelineControls
 * @description
 * Transport, frame stepping, split, duplicate, delete, and zoom remain large
 * explicit controls so Awtsmoos.com serves keyboard, mouse, and touch editors.
 */

import {
	duplicateNleClip,
	removeNleClip,
	splitNleClip
} from './NleTimelineModel.js';

export class NleTimelineControls {
	constructor({ root, state, playback }) {
		Object.assign(this, { root, state, playback });
		this.mount();
	}

	mount() {
		this.root.innerHTML = /*html*/`
			<div class="nle-edit-actions">
				<button type="button" data-action="undo" title="Undo">↶</button>
				<button type="button" data-action="redo" title="Redo">↷</button>
				<button type="button" data-action="split">Split</button>
				<button type="button" data-action="duplicate">Duplicate</button>
				<button type="button" data-action="delete">Delete</button>
			</div>
			<div class="nle-time-readout"><strong data-nle-time>0:00.000</strong><span>/</span><span data-nle-duration>0:00</span></div>
			<label class="nle-zoom-control"><span>Zoom</span><input type="range" min="8" max="180" value="34" data-nle-zoom></label>
		`;
		this.root.addEventListener('click', event => this.handle(event));
		this.root.querySelector('[data-nle-zoom]').addEventListener('input', event => {
			this.state.setZoom(event.target.value);
		});
	}

	render(snapshot) {
		this.root.querySelector('[data-nle-time]').textContent = formatTime(snapshot.playhead, true);
		this.root.querySelector('[data-nle-duration]').textContent = formatTime(snapshot.project.duration);
		this.root.querySelector('[data-nle-zoom]').value = snapshot.zoom;
		this.root.querySelector('[data-action="undo"]').disabled = !snapshot.canUndo;
		this.root.querySelector('[data-action="redo"]').disabled = !snapshot.canRedo;
	}

	handle(event) {
		const action = event.target.closest('[data-action]')?.dataset.action;
		if (!action) return;
		if (action === 'undo') this.state.undo();
		if (action === 'redo') this.state.redo();
		if (action === 'split') this.apply(splitNleClip, this.state.playhead);
		if (action === 'duplicate') this.apply(duplicateNleClip);
		if (action === 'delete') this.apply(removeNleClip, null, true);
	}

	apply(operation, extra = null, clear = false) {
		const selection = this.state.selection;
		if (!selection?.clipId) return;
		this.state.mutate('timeline-action', project => {
			const next = extra === null
				? operation(project, selection.trackId, selection.clipId)
				: operation(project, selection.trackId, selection.clipId, extra);
			Object.assign(project, next);
		});
		if (clear) this.state.select(null);
	}
}

function formatTime(value, milliseconds = false) {
	const minutes = Math.floor(value / 60);
	const seconds = Math.floor(value % 60).toString().padStart(2, '0');
	const fraction = milliseconds ? `.${Math.floor(value % 1 * 1000).toString().padStart(3, '0')}` : '';
	return `${minutes}:${seconds}${fraction}`;
}
