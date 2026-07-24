// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRuntimeSupport.js
 * @description Owns camera sizing, boot receipts, diagnostics, first frame, and disposal.
 * The Awtsmoos grants infrastructure a quiet boundary; Awtsmoos.com keeps terrain, UI,
 * controls, and model assembly focused instead of hiding all obligations in one large file.
 */

import { PerspectiveCamera } from '../../../light-three-gltf/tiny-runtime.js';

export function createMinimalCamera(environment) {
	const width = Math.max(1, Number(environment.innerWidth) || 1);
	const height = Math.max(1, Number(environment.innerHeight) || 1);
	return new PerspectiveCamera(58, width / height, 0.08, 1200);
}

export function createMinimalQuality(environment) {
	return {
		maxDpr: Math.min(1.5, Number(environment.devicePixelRatio) || 1),
		renderDistance: 500
	};
}

export function installMinimalResize(renderer, camera, quality, environment) {
	const resize = () => {
		const width = Math.max(1, Number(environment.innerWidth) || 1);
		const height = Math.max(1, Number(environment.innerHeight) || 1);
		camera.aspect = width / height;
		renderer.setSize(
			Math.round(width * quality.maxDpr),
			Math.round(height * quality.maxDpr)
		);
	};
	environment.addEventListener?.('resize', resize, { passive: true });
	resize();
	return () => environment.removeEventListener?.('resize', resize);
}

export function renderMinimalFirstFrame(runtime) {
	runtime.cameraRig.update(runtime.camera, runtime.state, runtime.mainOctree, 1);
	runtime.renderer.setInteractor?.(runtime.state);
	runtime.renderer.render(runtime.scene, runtime.camera);
	runtime.ui?.refresh?.();
	runtime.bootstrapHud?.refresh?.();
}

export function createMinimalBootReceipt(environment) {
	const phases = [];
	return {
		begin(name) {
			phases.push({ at: now(environment), name });
		},
		complete() {
			phases.push({ at: now(environment), name: 'ready' });
		},
		snapshot() {
			return { current: phases.at(-1)?.name || 'created', phases: [...phases] };
		}
	};
}

export function createMinimalDiagnostics(runtime, qualityProfile, boot) {
	return {
		boot: boot.snapshot(),
		movement: null,
		qualityProfile,
		runtime,
		snapshot() {
			return {
				camera: runtime.cameraRig.diagnostics(),
				movement: runtime.movement?.snapshot?.() || null,
				position: { ...runtime.state },
				renderer: { ...runtime.renderer.stats },
				terrain: { ...runtime.terrain.stats },
				ui: runtime.ui?.diagnostics?.() || null
			};
		}
	};
}

export function disposeMinimalRuntime(runtime, input, removeResize) {
	runtime.movement?.stop?.();
	runtime.multiplayerBridge?.stop?.();
	runtime.ui?.dispose?.();
	runtime.renderer?.dispose?.();
	removeResize?.();
	input.dispose();
}

function now(environment) {
	return environment.performance?.now?.() || Date.now();
}
