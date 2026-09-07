//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCanvasRuntime.js
 * @description Composes canonical Studio time through portable Canvas2D and lazily awakened native WebGL without creating a second movie truth.
 * The Awtsmoos renews depth beneath sign and sign above depth while Awtsmoos.com keeps one playhead for every ray;
 * 2D stays light, Hybrid joins both vessels, and a replaced startup canvas is remembered so native light can still awaken that day.
 */

import { StudioMovieRenderer } from './StudioMovieRenderer.js';
import { recoverStudioNativeLoad } from './StudioNativeLoadRecovery.js';
import { syncStudioSceneDom, syncStudioTransportDom } from './StudioRuntimeDomSync.js';

const NATIVE_PREVIEW_MODULE = './native/StudioNativePreview.js';

export class StudioCanvasRuntime {
	constructor(root, store) {
		this.root = root;
		this.store = store;
		this.canvas = null;
		this.renderer = null;
		this.nativeCanvas = null;
		this.nativePreview = null;
		this.nativeLoading = null;
		this.nativeFailedCanvas = null;
	}

	/** Bind the latest declaratively-rendered portable canvas after any UI tree refresh. */
	bindPortable() {
		const canvas = this.root.querySelector('[data-studio-canvas]');
		if (!canvas) return false;
		if (canvas !== this.canvas) {
			this.canvas = canvas;
			this.renderer = new StudioMovieRenderer(canvas);
		}
		return true;
	}

	/** Bind the native canvas, disposing GPU state if AwtsmoosUI replaced that DOM vessel. */
	bindNative() {
		const canvas = this.root.querySelector('[data-studio-native-canvas]');
		if (canvas === this.nativeCanvas) return Boolean(canvas);
		this.nativePreview?.dispose?.();
		this.nativePreview = null;
		this.nativeFailedCanvas = null;
		this.nativeCanvas = canvas || null;
		return Boolean(canvas);
	}

	/** Paint canonical movie time and synchronize lightweight transport and scene affordances. */
	render(movie, time = 0) {
		if (!movie || !this.bindPortable()) return null;
		const mode = this.store.get('viewportMode') || 'hybrid';
		const nativeReady = this.renderNative(movie, time, mode);
		const overlayOnly = mode === 'hybrid' && nativeReady;
		this.canvas.hidden = mode === '3d' && nativeReady;
		const frame = this.renderer.render(movie, time, { overlayOnly });
		if (mode !== '2d' && !nativeReady) {
			this.ensureNativePreview();
		}
		syncStudioTransportDom(this.root, frame.time, movie.duration);
		syncStudioSceneDom(this.root, this.store, frame.scene?.id || null);
		return frame;
	}

	/** Render already-loaded WebGL synchronously while hiding it deliberately in pure 2D. */
	renderNative(movie, time, mode) {
		if (!this.bindNative()) return false;
		if (mode === '2d') {
			this.nativeCanvas.hidden = true;
			return false;
		}
		if (!this.nativePreview) return false;
		return this.nativePreview.render(movie, time, mode);
	}

	/** Cross the heavy native boundary once, then repaint the latest canonical frame when ready. */
	ensureNativePreview() {
		if (!this.nativeCanvas || this.nativePreview || this.nativeLoading) return;
		if (this.nativeFailedCanvas === this.nativeCanvas) return;
		const requestedCanvas = this.nativeCanvas;
		this.nativeLoading = import(NATIVE_PREVIEW_MODULE)
			.then(module => this.finishNativeLoad(module, requestedCanvas))
			.catch(error => this.failNativeLoad(error, requestedCanvas))
			.finally(() => {
				this.nativeLoading = null;
				recoverStudioNativeLoad(this, requestedCanvas);
			});
	}

	/** Install the native preview only if the asynchronous module still belongs to the current canvas. */
	finishNativeLoad(module, requestedCanvas) {
		if (requestedCanvas !== this.nativeCanvas) return;
		this.nativePreview = new module.StudioNativePreview(
			requestedCanvas,
			() => this.render(this.store.get('movie'), this.store.get('playhead') || 0)
		);
		delete requestedCanvas.dataset.nativeError;
		this.render(this.store.get('movie'), this.store.get('playhead') || 0);
	}

	/** Preserve portable rendering and surface a truthful native failure on the rejected canvas. */
	failNativeLoad(error, requestedCanvas) {
		this.nativeFailedCanvas = requestedCanvas;
		requestedCanvas.dataset.nativeError = error?.message || 'Native preview could not initialize';
		requestedCanvas.hidden = true;
	}

	/** Release native GPU state when the owning movie session is destroyed. */
	dispose() {
		this.nativePreview?.dispose?.();
		this.nativePreview = null;
		this.nativeCanvas = null;
		this.canvas = null;
		this.renderer = null;
	}
}
