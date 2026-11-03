//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMovieSession.js
 * @description Holds one canonical movie session across visual playback, durable audio, project history, recovery, native rendering, and lazy AI direction.
 * The Awtsmoos keeps one movie truth beneath eye, ear, playhead, memory, and human speech;
 * Awtsmoos.com lets imported sound and native depth awaken only as vessels around that truth, while every loaded project begins a fresh reversible lineage within reach.
 */

import { StudioLazyAiDirector } from '../loading/StudioLazyAiDirector.js';
import { StudioAudioAssetStore } from '../media/StudioAudioAssetStore.js';
import { StudioProjectController } from '../projects/StudioProjectController.js';
import { liftStudioMovieTitle, normalizeStudioSharedMovie } from '../StudioSharedMovieContract.js';
import { StudioAudioRuntime } from './audio/StudioAudioRuntime.js';
import { StudioCanvasRuntime } from './StudioCanvasRuntime.js';
import { projectStudioLoadedMovie } from './StudioMovieSessionState.js';
import { StudioPlaybackController } from './StudioPlaybackController.js';

export class StudioMovieSession {
	constructor({ root, store }) {
		this.root = root;
		this.store = store;
		this.runtime = new StudioCanvasRuntime(root, store);
		this.audioAssets = new StudioAudioAssetStore();
		this.audioRuntime = new StudioAudioRuntime(this.audioAssets);
		this.playback = new StudioPlaybackController({
			store,
			runtime: this.runtime,
			audioRuntime: this.audioRuntime
		});
		this.project = new StudioProjectController(store.get('movie'));
		this.director = new StudioLazyAiDirector();
		this.unsubscribe = null;
		this.restoredOnBoot = false;
	}

	mount() {
		this.unsubscribe = this.store.subscribe(() => {
			queueMicrotask(() => this.rebind());
		});
		this.restoredOnBoot = this.restoreStoredMovie();
		if (!this.restoredOnBoot) this.rebind();
		return this;
	}

	/**
	 * Restore the latest locally recovered movie instead of silently reseeding
	 * the showcase. Recovery is written on every committed edit and load, so
	 * its presence is the explicit signal that real work exists to restore;
	 * with no recovery stored, the seeded showcase stays untouched.
	 */
	restoreStoredMovie() {
		try {
			if (!this.project.hasRecovery()) return false;
			const movie = this.project.recover();
			if (!movie?.scenes?.length) return false;
			this.loadMovie(movie, 'Recovered your last Studio session — work in progress was restored.', { dirty: true });
			return true;
		} catch (error) {
			this.store.set('status', `Saved recovery could not be restored: ${error.message}`);
			return false;
		}
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

	loadMovie(movie, status, options = {}) {
		this.playback.pause(false);
		liftStudioMovieTitle(movie);
		const loaded = this.project.reset(movie, { recover: options.recover !== false });
		projectStudioLoadedMovie(this.store, loaded, this.project, status, options);
		return loaded;
	}

	destroy() {
		this.playback.pause(false);
		void this.audioRuntime.dispose();
		this.runtime.dispose?.();
		this.unsubscribe?.();
		this.unsubscribe = null;
	}
}
