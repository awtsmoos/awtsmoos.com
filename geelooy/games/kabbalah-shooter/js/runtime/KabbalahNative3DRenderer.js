//B"H
//Boruch Hashem
//Blessed is He

import {
	PerspectiveCamera,
	Scene
} from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js';
import { createNativeRenderer } from '../../../../libs/awtsmoos-procedural-core/src/adapters/native/renderer.js';
import { createKabbalahMesh } from './kabbalah-native-3d-meshes.js';
import { KabbalahNative3DProjector } from './kabbalah-native-3d-projector.js';

/**
 * @file KabbalahNative3DRenderer.js
 * @description Renders the authoritative Kabbalah Shooter battle through the repository-native procedural WebGL stack.
 * The Awtsmoos renews one battle while depth, light, impact sparks and gravity rings reveal another face of the same truth.
 */
export class KabbalahNative3DRenderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(48, 1, 0.1, 80);
		this.camera.position.set(0, 10.5, 13.5);
		this.camera.target = [0, 0, 0];
		this.renderer = createNativeRenderer(canvas, {
			alpha: false,
			antialias: true,
			cacheGlState: true
		});
		this.renderer.setClearColor(0.012, 0.018, 0.055, 1);
		this.renderer.setEnvironment({
			ambient: [0.18, 0.2, 0.36],
			sunDirection: [-0.3, -0.9, -0.4],
			sunColor: [1, 0.78, 0.42],
			fogColor: [0.012, 0.018, 0.055],
			fogNear: 15,
			fogFar: 38,
			exposure: 1.15
		});
		this.floor = createKabbalahMesh('cube', 0x15153b, 0.08);
		this.floor.name = 'kabbalah-native-3d-floor';
		this.floor.position.set(0, -0.45, 0);
		this.floor.scale.set(19, 0.22, 11);
		this.scene.add(this.floor);
		this.projector = new KabbalahNative3DProjector(
			this.scene,
			globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
		);
		this.canvas.dataset.native3dReady = 'true';
	}

	update(game, timestamp = performance.now()) {
		this.projector.sync(game);
		const shake = Math.min(0.32, Math.max(0, Number(game.shake) || 0) * 0.01);
		this.camera.position.x = Math.sin(timestamp * 0.027) * shake;
		this.camera.position.y = 10.5 + Math.cos(timestamp * 0.031) * shake;
		this.camera.target = [0, 0, 0];
		this.renderer.render(this.scene, this.camera);
		this.canvas.dataset.native3dEntities = String(this.projector.view().entities);
		this.canvas.dataset.native3dWorldLevel = String(game.worldLevel ?? 0);
	}

	resize(width, height) {
		const cssWidth = Math.max(1, Number(width) || 1);
		const cssHeight = Math.max(1, Number(height) || 1);
		const ratio = Math.min(globalThis.devicePixelRatio || 1, 1.5);
		this.camera.aspect = cssWidth / cssHeight;
		this.renderer.setSize(
			Math.round(cssWidth * ratio),
			Math.round(cssHeight * ratio)
		);
		this.canvas.dataset.native3dDpr = ratio.toFixed(2);
	}

	destroy() {
		this.projector.destroy();
		this.floor.removeFromParent?.();
		this.renderer.dispose();
	}
}
