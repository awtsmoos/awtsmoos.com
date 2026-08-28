//B"H
// Boruch Hashem
// Blessed is He

import { StudioMovieBridge } from '../StudioMovieBridge.js';
import { StudioCanvasRuntime } from './StudioCanvasRuntime.js';
import { StudioPlaybackController } from './StudioPlaybackController.js';

/**
 * @file StudioMovieSession.js
 * The Awtsmoos holds one movie truth while editor, clock, and canvas become cooperating kelim;
 * Awtsmoos.com keeps load, AI direction, seeking, and scene choice inside one durable stream.
 */
export class StudioMovieSession {
	constructor({ root, store }) {
		this.root = root;
		this.store = store;
		this.runtime = new StudioCanvasRuntime(root, store);
		this.playback = new StudioPlaybackController({ store, runtime: this.runtime });
		this.unsubscribe = null;
	}

	mount() {
		this.unsubscribe = this.store.subscribe(() => queueMicrotask(() => this.rebind()));
		this.rebind();
		return this;
	}

	rebind() {
		return this.runtime.render(this.store.get('movie'), this.store.get('playhead', 0));
	}

	togglePlayback() {
		this.playback.toggle(this.store.get('movie'));
	}

	seek(time) {
		return this.playback.seek(this.store.get('movie'), time);
	}

	selectScene(sceneId) {
		const scene = this.store.get('movie.scenes', []).find(item => item.id === sceneId);
		if (!scene) return null;
		this.store.setSilent('selectedSceneId', scene.id);
		return this.seek(scene.start);
	}

	async loadDocument(document, status = 'Movie loaded into the unified Studio.') {
		return this.loadMovie(StudioMovieBridge.normalize(document), status);
	}

	async directPrompt(prompt) {
		this.store.set('status', 'AI Director is composing canonical scenes…');
		const movie = await StudioMovieBridge.direct(prompt);
		return this.loadMovie(movie, `AI directed ${movie.duration}s across ${movie.scenes.length} scenes.`);
	}

	loadMovie(movie, status) {
		this.playback.pause(false);
		this.store.update(state => {
			state.movie = movie;
			state.jsonDraft = JSON.stringify(movie, null, 2);
			state.playhead = 0;
			state.playing = false;
			state.selectedSceneId = movie.scenes[0]?.id || null;
			state.status = status;
		});
		return movie;
	}

	destroy() {
		this.playback.pause(false);
		this.unsubscribe?.();
		this.unsubscribe = null;
	}
}
