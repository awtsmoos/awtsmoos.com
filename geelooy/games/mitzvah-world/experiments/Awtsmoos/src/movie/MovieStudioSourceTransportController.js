// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSourceTransportController.js
 * @description Owns removable native source play, pause, frame-step, and time presentation.
 * The Awtsmoos is beyond source and program while each finite monitor needs its own witness;
 * Awtsmoos.com keeps source transport local, bounded, accessible, and cleanly releasable.
 */

import {
	sourcePreviewState,
	stepMovieStudioMediaPreview,
	toggleMovieStudioMediaPreview
} from './MovieStudioMediaPreview.js';

export class MovieStudioSourceTransportController {
	constructor(workspaceController) {
		this.controller = workspaceController;
		this.view = workspaceController.view;
		this.listeners = [];
		this.bind();
		this.paint(sourcePreviewState(this.view));
	}

	bind() {
		this.listen(this.view.sourceTransport, 'click', event => {
			const action = event.target.closest?.('[data-source-transport-action]')
				?.dataset.sourceTransportAction;
			if (action === 'toggle') toggleMovieStudioMediaPreview(this.view);
			if (action === 'back') this.step(-1);
			if (action === 'forward') this.step(1);
		});
		this.listen(this.view.preview, 'movie-source-preview-state', event => {
			this.paint(event.detail);
		});
	}

	step(frames) {
		const state = stepMovieStudioMediaPreview(
			this.view, frames, this.controller.session.project.fps
		);
		this.paint(state);
	}

	paint(state = sourcePreviewState(this.view)) {
		if (!this.view.previewTime) return;
		this.view.previewTime.textContent = `${format(state.time)} / ${format(state.duration)}`;
		this.view.sourceToggle?.setAttribute('aria-pressed', String(state.playing));
		if (this.view.sourceToggle) this.view.sourceToggle.textContent = state.playing ? 'Pause source' : 'Play source';
	}

	listen(target, type, listener) {
		target?.addEventListener?.(type, listener);
		this.listeners.push(() => target?.removeEventListener?.(type, listener));
	}

	destroy() {
		this.listeners.splice(0).forEach(remove => remove());
	}
}

function format(value) {
	return `${Number(value || 0).toFixed(3)}s`;
}
