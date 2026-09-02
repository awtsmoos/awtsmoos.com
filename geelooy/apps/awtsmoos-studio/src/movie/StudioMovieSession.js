//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMovieSession.js
 * @description Holds one canonical movie session while lightweight normalization stays immediate and AI/procedural direction crosses a late feature gate only when requested.
 * The Awtsmoos keeps one movie truth beneath playhead, selection, canvas, and human speech;
 * Awtsmoos.com lets ordinary editing awaken without AI weight, then summons deeper direction only when intention reaches deep.
 */
import { StudioLazyAiDirector } from '../loading/StudioLazyAiDirector.js';
import { normalizeStudioSharedMovie } from '../StudioSharedMovieContract.js';
import { StudioCanvasRuntime } from './StudioCanvasRuntime.js';
import { StudioPlaybackController } from './StudioPlaybackController.js';

export class StudioMovieSession {
	constructor({ root, store }) {
		this.root = root;
		this.store = store;
		this.runtime = new StudioCanvasRuntime(root, store);
		this.playback = new StudioPlaybackController({
			store,
			runtime: this.runtime
		});
		this.director = new StudioLazyAiDirector();
		this.unsubscribe = null;
	}

	/** Subscribes the Canvas runtime to canonical movie/store changes. */
	mount() {
		this.unsubscribe = this.store.subscribe(() => {
			queueMicrotask(() => this.rebind());
		});
		this.rebind();
		return this;
	}

	/** Renders the current canonical movie at the current playhead. */
	rebind() {
		return this.runtime.render(
			this.store.get('movie'),
			this.store.get('playhead', 0)
		);
	}

	/** Toggles playback against the currently loaded canonical movie. */
	togglePlayback() {
		this.playback.toggle(this.store.get('movie'));
	}

	/** Seeks the canonical playback controller. */
	seek(time) {
		return this.playback.seek(this.store.get('movie'), time);
	}

	/** Selects one scene and seeks to its canonical start time. */
	selectScene(sceneId) {
		const scene = this.store.get('movie.scenes', []).find((item) => {
			return item.id === sceneId;
		});
		if (!scene) {
			return null;
		}
		this.store.setSilent('selectedSceneId', scene.id);
		return this.seek(scene.start);
	}

	/** Normalizes and loads a shared movie without importing AI or procedural machinery. */
	async loadDocument(document, status = 'Movie loaded into the unified Studio.') {
		return this.loadMovie(
			normalizeStudioSharedMovie(document),
			status
		);
	}

	/** Loads AI direction lazily only after a prompt explicitly requests it. */
	async directPrompt(prompt) {
		this.store.set('status', 'Loading AI Director…');
		const movie = await this.director.direct(prompt);
		return this.loadMovie(
			movie,
			`AI directed ${movie.duration}s across ${movie.scenes.length} scenes.`
		);
	}

	/** Replaces canonical movie truth and resets transient playhead/selection coherently. */
	loadMovie(movie, status) {
		this.playback.pause(false);
		const firstScene = movie.scenes[0] || null;
		this.store.update((state) => {
			state.movie = movie;
			state.jsonDraft = JSON.stringify(movie, null, 2);
			state.playhead = 0;
			state.playing = false;
			state.selectedSceneId = firstScene?.id || null;
			state.selectedLayerId = firstEditableLayer(firstScene)?.id || null;
			state.status = status;
		});
		return movie;
	}

	/** Stops playback and releases the store subscription owned by this session. */
	destroy() {
		this.playback.pause(false);
		this.unsubscribe?.();
		this.unsubscribe = null;
	}
}

/** Returns the first non-audio layer suitable for immediate visual editing. */
function firstEditableLayer(scene) {
	return (scene?.layers || []).find((layer) => {
		return layer.kind !== 'audio';
	}) || null;
}
