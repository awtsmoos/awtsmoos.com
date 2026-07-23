// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMinimalMeadowRuntime.js
 * @description Opens one meadow, one Chossid, one octree, and one yielding movement loop directly.
 * The Awtsmoos reveals readiness before recurring motion; Awtsmoos.com keeps the page responsive
 * while only camera, renderer, collision, input, one model, and realtime enter the shared field.
 */

import { Group, PerspectiveCamera, Scene } from '../../../light-three-gltf/tiny-runtime.js';
import { installBootstrapControlsHud } from './BootstrapControlsHud.js';
import { createBootstrapPlayerRuntime } from './BootstrapPlayerRuntime.js?v=20260723-meadow-04';
import { createBootstrapVisibleWorld } from './BootstrapVisibleWorld.js?v=20260723-meadow-04';
import { createMinimalMeadowCollision } from './MinimalMeadowCollision.js?v=20260723-meadow-04';
import { MinimalMeadowInput } from './MinimalMeadowInput.js?v=20260723-meadow-04';
import { startMinimalMeadowLoop } from './MinimalMeadowLoop.js?v=20260723-meadow-04';
import { hydrateMinimalMeadowPlayer } from './MinimalMeadowPlayerHydration.js?v=20260723-meadow-04';
import { createMinimalMeadowRenderer } from './MinimalMeadowRenderer.js?v=20260723-meadow-04';
import {
	markRuntimePlayable,
	markRuntimeStarting
} from './RuntimeStateMarker.js?v=20260723-meadow-03';

export async function createMinimalMeadowRuntime(hosts, options = {}) {
	const environment = options.environment || globalThis;
	const documentValue = environment.document;
	const boot = createBootReceipt(environment);
	markRuntimeStarting(documentValue);
	boot.begin('minimal-meadow-services');
	const qualityProfile = createQualityProfile(environment);
	const scene = new Scene();
	const camera = createCamera(environment);
	const renderer = createMinimalMeadowRenderer(hosts.canvas);
	installResize(renderer, camera, qualityProfile, environment);
	const input = new MinimalMeadowInput(environment, hosts.jumpHost);
	const collision = createMinimalMeadowCollision();
	scene.add(createBootstrapVisibleWorld());
	boot.begin('minimal-meadow-player');
	const runtime = createBootstrapPlayerRuntime({
		...hosts,
		...collision,
		assets: createAssetReceipt(),
		camera,
		input,
		joystick: null,
		jumpButton: null,
		playerGltf: { animations: [], scene: new Group() },
		qualityProfile,
		renderer,
		scene,
		terrain: createTerrainReceipt(collision.collisionTriangles)
	});
	runtime.canonicalPlayer = { status: 'loading' };
	runtime.districtStreaming = null;
	runtime.worldMode = 'minimal-meadow';
	installBootstrapControlsHud(runtime, documentValue);
	renderFirstFrame(runtime);
	boot.complete();
	const diagnostics = createDiagnostics(runtime, qualityProfile, boot);
	environment.AwtsmoosBootError = null;
	environment.AwtsmoosDiagnostics = diagnostics;
	markRuntimePlayable(diagnostics, documentValue);
	if (options.startLoop !== false) {
		runtime.movement = startMinimalMeadowLoop(runtime, environment);
		diagnostics.movement = runtime.movement;
	}
	runtime.dispose = () => disposeRuntime(runtime, input);
	diagnostics.canonicalPlayerPromise = hydrateMinimalMeadowPlayer(runtime, environment);
	return diagnostics;
}

function createCamera(environment) {
	const width = Math.max(1, Number(environment.innerWidth) || 1);
	const height = Math.max(1, Number(environment.innerHeight) || 1);
	return new PerspectiveCamera(58, width / height, 0.08, 1200);
}

function createQualityProfile(environment) {
	return {
		maxDpr: Math.min(1.5, Number(environment.devicePixelRatio) || 1),
		renderDistance: 500
	};
}

function installResize(renderer, camera, quality, environment) {
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
}

function renderFirstFrame(runtime) {
	runtime.camera.position.set(0, 4.2, -7);
	runtime.camera.target = [0, 1.25, 0];
	runtime.renderer.setInteractor?.(runtime.state);
	runtime.renderer.render(runtime.scene, runtime.camera);
	runtime.bootstrapHud?.refresh?.();
}

function createDiagnostics(runtime, qualityProfile, boot) {
	return {
		boot: boot.snapshot(),
		movement: null,
		qualityProfile,
		runtime,
		snapshot() {
			return {
				boot: boot.snapshot(),
				movement: runtime.movement?.snapshot?.() || null,
				position: { ...runtime.state },
				renderer: { ...runtime.renderer.stats },
				worldMode: runtime.worldMode
			};
		}
	};
}

function createTerrainReceipt(collisionTriangles) {
	return {
		stats: {
			collisionTriangles,
			districts: 0,
			visualMode: 'minimal-shared-meadow'
		}
	};
}

function createAssetReceipt() {
	return {
		actorAssets: { strategy: 'fallback-then-one-glb' },
		importedModelMaterials: {}
	};
}

function createBootReceipt(environment) {
	const phases = [];
	return {
		begin(name) {
			phases.push({ at: environment.performance?.now?.() || Date.now(), name });
		},
		complete() {
			phases.push({ at: environment.performance?.now?.() || Date.now(), name: 'ready' });
		},
		snapshot() {
			return { current: phases.at(-1)?.name || 'created', phases: [...phases] };
		}
	};
}

function disposeRuntime(runtime, input) {
	runtime.movement?.stop?.();
	runtime.multiplayerBridge?.stop?.();
	runtime.renderer?.dispose?.();
	input.dispose();
}

export default createMinimalMeadowRuntime;
