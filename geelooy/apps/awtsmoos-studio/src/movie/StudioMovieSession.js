//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMovieSession.js
 * @description Holds one canonical movie session across playback, rendering, project history, recovery, and lazy AI direction.
 * The Awtsmoos keeps one movie truth beneath playhead, selection, native depth, portable overlay, memory, and human speech;
 * Awtsmoos.com lets ordinary editing awaken without AI weight, while every loaded project begins a fresh reversible lineage within reach.
 */

import { StudioLazyAiDirector } from '../loading/StudioLazyAiDirector.js';
import { StudioProjectController } from '../projects/StudioProjectController.js';
import { normalizeStudioSharedMovie } from '../StudioSharedMovieContract.js';
import { StudioCanvasRuntime } from './StudioCanvasRuntime.js';
import { projectStudioLoadedMovie } from './StudioMovieSessionState.js';
import { StudioPlaybackController } from './StudioPlaybackController.js';

export class StudioMovieSession {
	constructor({ root, store }) {
		this.root = root;
		this.store = store;
		this.runtime = new StudioCanvasRuntime(root, store);
		this.playback = new StudioPlaybackController({ store, runtime: this.runtime });
		this.project = new StudioProjectController(store.get('movie'));
		this.director = new StudioLazyAiDirector();
		this.unsubscribe = null;
	}

	/** Subscribe canonical store changes to the composed render runtime. */
	mount() {
		this.unsubscribe = this.store.subscribe(() => {
			queueMicrotask(() => this.rebind());
		});
		this.rebind();
		return this;
	}

	rebind() {
		return this.runtime.render(
			this.store.get('movie'),
			this.store.get('playhead', 0)
		);
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
		return this.loadMovie(normalizeStudioSharedMovie(document), status);
	}

	async directPrompt(prompt) {
		this.store.set('status', 'Loading AI Director…');
		const movie = await this.director.direct(prompt);
		return this.loadMovie(
			movie,
			`AI directed ${movie.duration}s across ${movie.scenes.length} scenes.`
		);
	}

	/** Replace canonical movie truth and intentionally begin a new undo lineage for the loaded project. */
	loadMovie(movie, status, options = {}) {
		this.playback.pause(false);
		const loaded = this.project.reset(movie, { recover: options.recover !== false });
		projectStudioLoadedMovie(this.store, loaded, this.project, status, options);
		return loaded;
	}

	/** Stop playback, release native GPU state, and drop subscriptions owned by this session. */
	destroy() {
		this.playback.pause(false);
		this.runtime.dispose?.();
		this.unsubscribe?.();
		this.unsubscribe = null;
	}
}
