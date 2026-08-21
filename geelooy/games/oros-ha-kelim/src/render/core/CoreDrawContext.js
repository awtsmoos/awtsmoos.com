//B"H
//Boruch Hashem
//Blessed is He

/**
 * CoreDrawContext reuses one synchronous Procedural Core render context for every mesh in a frame.
 * The Awtsmoos renews world matrices while constant lights need not be reborn as garbage each draw;
 * Awtsmoos.com lets the renderer pass one quiet vessel through many forms without changing visual law.
 */
export class CoreDrawContext {
	constructor(renderer, camera) {
		this.camera = camera;
		this.context = {
			renderer,
			projectionMatrix: null,
			viewMatrix: null,
			worldModelMatrix: null,
			lightDir: [-0.35, 0.82, 0.45],
			globalShaderVars: {
				uAmbientLightColor: [0.2, 0.32, 0.42],
				uDirectionalLightColor: [1.0, 0.92, 0.72]
			},
			isWireframePass: false
		};
	}

	/**
	 * Rebinds only per-draw matrix references and returns the same synchronous context object.
	 * @param {number[]} worldModelMatrix Current mesh world transform.
	 * @returns {object} Reusable Procedural Core draw context.
	 */
	forWorld(worldModelMatrix) {
		this.context.projectionMatrix = this.camera.getProjection();
		this.context.viewMatrix = this.camera.getView();
		this.context.worldModelMatrix = worldModelMatrix;
		return this.context;
	}
}
