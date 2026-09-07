//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioNativePreview.js
 * @description Owns native WebGL for 3D and Hybrid while canonical Studio layers remain the sole source of world truth.
 * The Awtsmoos renews depth beneath every optional sign, and Awtsmoos.com lets each real Chossid enter only from canonical scene law;
 * generated matter rebuilds when structural truth changes, while ordinary playback keeps flowing through the same movie draw.
 */

import { createNativeRenderer } from '../../../../../libs/awtsmoos-procedural-core/src/adapters/native/renderer.js';
import { loadStudioNativeChossid } from './StudioNativeCharacter.js';
import {
	getStudioChossidRecipes,
	getStudioNativeScene,
	getStudioNativeSceneSignature
} from './StudioNativeSceneSelection.js';
import { buildStudioNativeWorld } from './StudioNativeWorldBuilder.js';

/** Native preview coordinator with sparse structural rebuilds and asynchronous real-character loading. */
export class StudioNativePreview {
	constructor(canvas, onInvalidate = () => {}) {
		this.canvas = canvas;
		this.onInvalidate = onInvalidate;
		this.renderer = createNativeRenderer(canvas, { alpha: false, antialias: true });
		this.signature = '';
		this.world = null;
		this.characterRequest = 0;
	}

	/** Render native depth for 3D/Hybrid and deliberately yield to portable Canvas2D in pure 2D. */
	render(movie, time = 0, mode = '3d') {
		if (mode === '2d') {
			this.canvas.hidden = true;
			return false;
		}
		try {
			const studioScene = getStudioNativeScene(movie, time);
			if (!studioScene) {
				this.canvas.hidden = true;
				return false;
			}
			const signature = getStudioNativeSceneSignature(studioScene);
			if (signature !== this.signature) {
				this.rebuild(studioScene, signature);
			}
			this.canvas.hidden = false;
			this.resize();
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

	/** Rebuild deterministic geometry, then repaint as each isolated Chossid GLB becomes available. */
	rebuild(studioScene, signature) {
		this.signature = signature;
		this.world = buildStudioNativeWorld(studioScene);
		delete this.canvas.dataset.characterError;
		const request = ++this.characterRequest;
		const characters = getStudioChossidRecipes(studioScene, this.world.characterY);
		for (const options of characters) {
			void loadStudioNativeChossid(options).then(actor => {
				if (request !== this.characterRequest || !this.world) return;
				this.world.scene.add(actor);
				delete this.canvas.dataset.characterError;
				this.onInvalidate();
			}).catch(error => {
				if (request !== this.characterRequest) return;
				this.canvas.dataset.characterError = error?.message || 'Chossid failed to load';
			});
		}
	}

	/** Match native render pixels to CSS geometry without allowing extreme mobile DPR to dominate frame cost. */
	resize() {
		const rect = this.canvas.getBoundingClientRect();
		const dpr = Math.min(Number(globalThis.devicePixelRatio || 1), 1.75);
		const width = Math.max(1, Math.round(rect.width * dpr));
		const height = Math.max(1, Math.round(rect.height * dpr));
		if (this.canvas.width !== width || this.canvas.height !== height) {
			this.renderer.setSize(width, height);
		}
		this.world.camera.aspect = width / height;
	}

	/** Release GPU resources and invalidate pending asynchronous character insertions. */
	dispose() {
		this.characterRequest += 1;
		this.renderer?.dispose?.();
		this.world = null;
	}
}
