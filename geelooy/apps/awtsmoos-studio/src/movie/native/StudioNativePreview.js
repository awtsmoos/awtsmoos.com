//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file StudioNativePreview.js
 * @description Owns the one native WebGL world runtime shared by interactive preview and exact-timestamp export capture.
 * The Awtsmoos renews depth beneath every optional sign, and Awtsmoos.com lets real Chossid assets enter only from canonical scene law;
 * preview may continue while assets descend, while export can await the same promise before it captures the finished native draw.
 * The shared render graph also raises procedural set pieces for model layers and flies the canonical camera kind as a rig when no camera layer authors one.
 */

import { createNativeRenderer } from '../../../../../libs/awtsmoos-procedural-core/src/adapters/native/renderer.js';
import { buildSceneRenderPlan } from '../../../../shared/movie/render/RenderGraph.js';
import { sampleCameraRig } from '../../../../shared/movie/render/CameraMotionPlan.js';
import { loadStudioNativeChossid } from './StudioNativeCharacter.js';
import {
	getStudioChossidRecipes,
	getStudioNativeScene,
	getStudioNativeSceneSignature,
	hasStudioNativeGeometry
} from './StudioNativeSceneSelection.js';
import { buildStudioNativeWorld } from './StudioNativeWorldBuilder.js';
import { createStudioStagePiece } from './StudioStagePieces.js';

export class StudioNativePreview {
	constructor(canvas, onInvalidate = () => {}) {
		this.canvas = canvas;
		this.onInvalidate = onInvalidate;
		this.renderer = createNativeRenderer(canvas, { alpha: false, antialias: true });
		this.signature = '';
		this.world = null;
		this.movie = null;
		this.plan = null;
		this.characterRequest = 0;
		this.characterPromise = Promise.resolve();
		this.worldPromise = Promise.resolve();
		this.characterError = null;
	}

	/** Render native matter, optionally with explicit export pixels instead of CSS geometry. */
	render(movie, time = 0, mode = '3d', size = null) {
		if (mode === '2d') return this.hide();
		try {
			this.movie = movie;
			const studioScene = getStudioNativeScene(movie, time);
			if (!studioScene || !hasStudioNativeGeometry(studioScene)) return this.hide();
			const signature = getStudioNativeSceneSignature(studioScene);
			if (signature !== this.signature) this.rebuild(studioScene, signature);
			this.canvas.hidden = false;
			this.resize(size);
			this.renderer.setEnvironment(this.world.environment);
			this.renderer.setInteractor({ x: 0, y: 0, z: 0 }, Number(time));
			this.applyCameraRig(studioScene, time);
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
		await Promise.all([this.worldPromise, this.characterPromise]);
		if (this.characterError) throw this.characterError;
	}

	rebuild(studioScene, signature) {
		this.signature = signature;
		this.world = buildStudioNativeWorld(studioScene);
		this.worldPromise = Promise.resolve(this.world.ready);
		this.characterError = null;
		delete this.canvas.dataset.characterError;
		this.plan = null;
		try {
			this.plan = buildSceneRenderPlan(this.movie || {}, studioScene);
			this.addStagePieces();
			delete this.canvas.dataset.stageError;
		} catch (error) {
			this.canvas.dataset.stageError = error?.message || 'Stage pieces failed';
		}
		const request = ++this.characterRequest;
		const recipes = getStudioChossidRecipes(studioScene, this.world.characterY);
		this.characterPromise = Promise.all(recipes.map(options => loadStudioNativeChossid(options)))
			.then(actors => this.acceptCharacters(request, actors))
			.catch(error => this.rejectCharacters(request, error));
	}

	/** Raise procedural set pieces, billboards, and backdrops from the shared render graph; Chossid descriptors keep their GLB path. */
	addStagePieces() {
		if (!this.plan || !this.world?.scene) return;
		const groundY = Math.max(0, Number(this.world.characterY ?? 1) - 1);
		for (const descriptor of this.plan.plate) {
			if (descriptor.model === 'chossid') continue;
			if (!['model', 'character', 'billboard', 'backdrop', 'piece'].includes(descriptor.form)) continue;
			try {
				this.world.scene.add(createStudioStagePiece(descriptor, { groundY }));
			} catch (error) {
				this.canvas.dataset.stageError = error?.message || 'Stage piece failed';
			}
		}
	}

	/** Fly the canonical camera kind as a rig unless an authored camera layer already owns the lens. */
	applyCameraRig(studioScene, time) {
		const camera = this.world?.camera;
		const rig = this.plan?.camera?.rig;
		if (!camera || !rig) return;
		if ((studioScene?.layers || []).some(layer => layer.kind === 'camera')) return;
		const duration = Math.max(0.000001, Number(studioScene?.duration || 0));
		const progress = Math.min(1, Math.max(0, (Number(time) - Number(studioScene?.start || 0)) / duration));
		const sample = sampleCameraRig(rig, progress);
		camera.position.set(sample.position.x, sample.position.y, sample.position.z);
		orientCamera(camera, sample.position, sample.lookAt);
		if (Number.isFinite(sample.fov)) {
			camera.fov = sample.fov;
			camera.updateProjectionMatrix?.();
		}
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
		this.plan = null;
		this.movie = null;
	}
}

/** Aim a native camera from position toward a target using the runtime's Euler-bound quaternion. */
function orientCamera(camera, position, lookAt) {
	const dx = Number(lookAt.x || 0) - Number(position.x || 0);
	const dy = Number(lookAt.y || 0) - Number(position.y || 0);
	const dz = Number(lookAt.z || 0) - Number(position.z || 0);
	const length = Math.hypot(dx, dy, dz);
	if (!length || !camera.rotation?.set) return;
	const yaw = Math.atan2(-dx / length, -dz / length);
	const pitch = Math.atan2(dy / length, Math.hypot(dx, dz) / length);
	camera.rotation.set(pitch, yaw, 0);
}
