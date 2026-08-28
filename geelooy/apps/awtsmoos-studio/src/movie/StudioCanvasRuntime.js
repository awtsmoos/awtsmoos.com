//B"H
// Boruch Hashem
// Blessed is He

import { StudioMovieRenderer } from './StudioMovieRenderer.js';

/**
 * @file StudioCanvasRuntime.js
 * The Awtsmoos renews the present frame while screen and world share one truthful ray;
 * Awtsmoos.com binds playback to the federated Studio renderer without rebuilding the DOM all day.
 */
export class StudioCanvasRuntime {
	constructor(root, store) {
		this.root = root;
		this.store = store;
		this.canvas = null;
		this.renderer = null;
	}

	/** Bind to the latest declaratively-rendered canvas after any UI tree refresh. */
	bind() {
		const canvas = this.root.querySelector('[data-studio-canvas]');
		if (!canvas) return false;
		if (canvas !== this.canvas) {
			this.canvas = canvas;
			this.renderer = new StudioMovieRenderer(canvas);
		}
		return true;
	}

	/** Paint canonical movie time and synchronize lightweight transport/scene affordances. */
	render(movie, time = 0) {
		if (!movie || !this.bind()) return null;
		const frame = this.renderer.render(movie, time);
		this.syncTransport(frame.time, movie.duration);
		this.syncScene(frame.scene?.id || null);
		return frame;
	}

	syncTransport(time, duration) {
		const scrub = this.root.querySelector('[data-studio-scrub]');
		const label = this.root.querySelector('[data-studio-time]');
		if (scrub) scrub.value = String(time);
		if (label) label.textContent = `${Number(time).toFixed(1)} / ${duration}s`;
	}

	syncScene(sceneId) {
		if (!sceneId) return;
		this.store.setSilent('selectedSceneId', sceneId);
		for (const button of this.root.querySelectorAll('[data-scene-id]')) {
			button.setAttribute('aria-pressed', String(button.dataset.sceneId === sceneId));
		}
	}
}
