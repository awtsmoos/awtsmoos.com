// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-webgl-renderer.js
 * @description Owns WebGL programs, buffers, materials, frame identity, and
 * skin residency through which the measured world appears before Awtsmoos.
 */
import { identity } from './tiny-math.js';
import { createRendererBufferCache } from './tiny-render-buffers.js';
import { renderFrame } from './tiny-render-frame.js';
import { createRendererMaterialSystem } from './tiny-render-material-system.js';
import {
	createProgramSet,
	createUniformAndAttributeLocations
} from './tiny-render-programs.js';
import { prepareSkeletonRenderer } from './tiny-render-skeleton.js';
import { SkinUniformBindingCache } from './tiny-render-skin-binding.js';
import { SkinTextureResidencyCache } from './tiny-render-skin-residency.js';
import {
	detectJointCapability,
	resizeCanvasToDisplaySize
} from './tiny-render-webgl-utils.js';

export class TinyWebGLRenderer {
	constructor({ canvas, alpha = true, antialias = true } = {}) {
		this.canvas = canvas;
		this.gl = canvas.getContext('webgl', {
			alpha,
			antialias,
			premultipliedAlpha: true
		});
		if (!this.gl) {
			throw new Error('WebGL is not available.');
		}
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.CULL_FACE);
		this.clearColor = [0, 0, 0, 1];
		this.programs = createProgramSet(this.gl);
		this.locations = createUniformAndAttributeLocations(
			this.gl,
			this.programs
		);
		Object.assign(this, createRendererBufferCache(this.gl));
		Object.assign(this, createRendererMaterialSystem(this.gl));
		Object.assign(this, detectJointCapability(this.gl));
		prepareSkeletonRenderer(this);
		this.skinUniformBindings = new SkinUniformBindingCache();
		this.skinTextureResidency = new SkinTextureResidencyCache();
		this.frameToken = 0;
		this.errors = [];
		this.stats = createInitialStats();
		this.lastProjection = identity();
		this.lastView = identity();
		this.interactor = {
			position: [0, 0, 0],
			time: 0
		};
		this.environment = {
			ambient: [0.46, 0.48, 0.44],
			sunDirection: [0.35, 0.92, 0.18],
			sunColor: [1, 0.95, 0.82]
		};
		resizeCanvasToDisplaySize(this.canvas);
	}

	setSize(width, height) {
		this.canvas.style.width = `${width}px`;
		this.canvas.style.height = `${height}px`;
		resizeCanvasToDisplaySize(this.canvas);
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	setClearColor(red, green, blue, alpha = 1) {
		this.clearColor = [red, green, blue, alpha];
	}

	setInteractor(state, time) {
		this.interactor.position = [
			state.x || 0,
			state.renderY || 0,
			state.z || 0
		];
		this.interactor.time = time || 0;
	}

	setEnvironment({ ambient, sunDirection, sunColor } = {}) {
		if (ambient) {
			this.environment.ambient = [...ambient];
		}
		if (sunDirection) {
			this.environment.sunDirection = [...sunDirection];
		}
		if (sunColor) {
			this.environment.sunColor = [...sunColor];
		}
	}

	render(scene, camera) {
		renderFrame(this, scene, camera);
	}

	dispose() {
		this.skinUniformBindings.invalidate();
		this.skinTextureResidency.reset();
		for (const program of Object.values(this.programs)) {
			this.gl.deleteProgram(program);
		}
		this.materialSystem.dispose();
	}
}

function createInitialStats() {
	return {
		draws: 0,
		triangles: 0,
		skinnedMeshes: 0,
		jointsUploaded: 0,
		skinPaletteRecomputes: 0,
		skinGpuUploads: 0
	};
}
