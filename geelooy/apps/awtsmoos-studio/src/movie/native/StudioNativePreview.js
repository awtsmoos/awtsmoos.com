//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioNativePreview.js
 * @description Owns the one native WebGL world runtime shared by interactive preview and exact-timestamp export capture.
 * The Awtsmoos renews depth beneath every optional sign, and Awtsmoos.com lets real Chossid assets enter only from canonical scene law;
 * preview may continue while assets descend, while export can await the same promise before it captures the finished native draw.
 */

import { createNativeRenderer } from '../../../../../libs/awtsmoos-procedural-core/src/adapters/native/renderer.js';
import { loadStudioNativeChossid } from './StudioNativeCharacter.js';
import {
	getStudioChossidRecipes,
	getStudioNativeScene,
	getStudioNativeSceneSignature,
	hasStudioNativeGeometry
} from './StudioNativeSceneSelection.js';
import { buildStudioNativeWorld } from './StudioNativeWorldBuilder.js';

export class StudioNativePreview {
	constructor(canvas, onInvalidate = () => {}) {
		this.canvas = canvas;
		this.onInvalidate = onInvalidate;
		this.renderer = createNativeRenderer(canvas, { alpha: false, antialias: true });
		this.signature = '';
		this.world = null;
		this.characterRequest = 0;
		this.characterPromise = Promise.resolve();
		this.characterError = null;
	}

	/** Render native matter, optionally with explicit export pixels instead of CSS geometry. */
	render(movie, time = 0, mode = '3d', size = null) {
		if (mode === '2d') return this.hide();
		try {
			const studioScene = getStudioNativeScene(movie, time);
			if (!studioScene || !hasStudioNativeGeometry(studioScene)) return this.hide();
			const signature = getStudioNativeSceneSignature(studioScene);
			if (signature !== this.signature) this.rebuild(studioScene, signature);
			this.canvas.hidden = false;
			this.resize(size);
			this.renderer.setEnvironment(this.world.environment);
			this.renderer.setInteractor({ x: 0, y: 0, z: 0 }, Number(time));
			this.renderer.render(this.world.scene, this.world.camera);
			delete this.canvas.dataset.nativeError;
			return true;
		} catch (error) {
			this.canvas.dataset.nativeError = error?.message || 'Native preview failed';
			this.canvas.hidden = true;
			return false;
		}
	}

	/** Await the current scene's real character assets; export calls this before final capture. */
	async settle() {
		await this.characterPromise;
		if (this.characterError) throw this.characterError;
	}

	rebuild(studioScene, signature) {
		this.signature = signature;
		this.world = buildStudioNativeWorld(studioScene);
		this.characterError = null;
		delete this.canvas.dataset.characterError;
		const request = ++this.characterRequest;
		const recipes = getStudioChossidRecipes(studioScene, this.world.characterY);
		this.characterPromise = Promise.all(recipes.map(options => loadStudioNativeChossid(options)))
			.then(actors => this.acceptCharacters(request, actors))
			.catch(error => this.rejectCharacters(request, error));
	}

	acceptCharacters(request, actors) {
		if (request !== this.characterRequest || !this.world) return;
		for (const actor of actors) this.world.scene.add(actor);
		delete this.canvas.dataset.characterError;
		this.onInvalidate();
	}

	rejectCharacters(request, error) {
		if (request !== this.characterRequest) return;
		this.characterError = error;
		this.canvas.dataset.characterError = error?.message || 'Chossid failed to load';
	}

	resize(size) {
		const rect = this.canvas.getBoundingClientRect?.() || { width: 0, height: 0 };
		const dpr = size ? Number(size.dpr || 1) : Math.min(Number(globalThis.devicePixelRatio || 1), 1.75);
		const cssWidth = Number(size?.width || rect.width || this.canvas.width || 1);
		const cssHeight = Number(size?.height || rect.height || this.canvas.height || 1);
		const width = Math.max(1, Math.round(cssWidth * dpr));
		const height = Math.max(1, Math.round(cssHeight * dpr));
		if (this.canvas.width !== width || this.canvas.height !== height) this.renderer.setSize(width, height);
		this.world.camera.aspect = width / height;
	}

	hide() {
		this.canvas.hidden = true;
		return false;
	}

	dispose() {
		this.characterRequest += 1;
		this.renderer?.dispose?.();
		this.world = null;
	}
}
