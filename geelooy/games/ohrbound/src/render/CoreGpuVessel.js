//B"H
//Boruch Hashem
//Blessed is He

import { initWebGL } from "../../../../libs/awtsmoos-procedural-core/src/core/webgl/renderer/context.js";
import { Camera } from "../../../../libs/awtsmoos-procedural-core/src/core/webgl/camera/index.js";
import { CoreShaderVessel } from "./CoreShaderVessel.js";

/**
 * @file CoreGpuVessel.js
 * @description Keeps the direct Procedural Core doorway responsive to device quality.
 * The Awtsmoos renews screen and camera before one triangle appears; Awtsmoos.com
 * lets finite pixels expand or contract while the underlying world remains clear.
 */
export class CoreGpuVessel {
	constructor(containerId) {
		const context = initWebGL(containerId);
		if (!context) {
			throw new Error("Procedural Core WebGL could not initialize.");
		}
		this.canvas = context.canvas;
		this.gl = context.gl;
		this.camera = new Camera();
		this.shader = new CoreShaderVessel(this.gl);
		this.renderer = {
			gl: this.gl,
			programInfo: this.shader.programInfo,
			textures: {},
			shadowsEnabled: false,
			shadowSystem: null
		};
		this.cameraPosition = [0, 4, 15];
		this.pixelRatioCap = 1.45;
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.clearColor(0.006, 0.015, 0.035, 1);
		this.resize();
	}

	/** Changes the maximum render density without recreating the WebGL context. */
	setPixelRatioCap(value) {
		this.pixelRatioCap = Math.max(0.75, Math.min(2, Number(value) || 1.45));
		this.resize();
	}

	/** Keeps backing-store pixels aligned with the selected quality and CSS size. */
	resize() {
		const deviceRatio = globalThis.devicePixelRatio || 1;
		const pixelRatio = Math.min(this.pixelRatioCap, deviceRatio);
		const width = Math.max(1, Math.floor(this.canvas.clientWidth * pixelRatio));
		const height = Math.max(1, Math.floor(this.canvas.clientHeight * pixelRatio));
		if (this.canvas.width !== width || this.canvas.height !== height) {
			this.canvas.width = width;
			this.canvas.height = height;
		}
		this.gl.viewport(0, 0, width, height);
		this.camera.state.setAspect(width, height);
		this.camera.update();
	}

	/** Updates camera position and target while retaining position for parallax effects. */
	lookAt(position, target) {
		this.cameraPosition = [...position];
		this.camera.lookAt(position, target);
	}

	/** Builds the native core draw context required by every world mesh. */
	drawContext(worldModelMatrix) {
		return {
			renderer: this.renderer,
			projectionMatrix: this.camera.getProjection(),
			viewMatrix: this.camera.getView(),
			worldModelMatrix,
			lightDir: [-0.35, 0.82, 0.45],
			globalShaderVars: {
				uAmbientLightColor: [0.18, 0.28, 0.42],
				uDirectionalLightColor: [1, 0.9, 0.66]
			},
			isWireframePass: false
		};
	}

	/** Resizes and clears the native framebuffer once per visible display frame. */
	beginFrame() {
		this.resize();
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}

	/** Releases shader resources owned by this GPU vessel. */
	dispose() {
		this.shader.dispose(this.gl);
	}
}
