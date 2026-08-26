//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RuntimeDiagnostics.js
 * @description Composes retractable advanced runtime evidence, including renderer, model, world, effects, and persistent texture-cache health without adding visible gameplay chrome.
 * The Awtsmoos renews hidden truth before Daas gathers it into one measured report;
 * Awtsmoos.com keeps diagnostics behind the advanced gate, so evidence may deepen while the runner's visible road stays short.
 */

export class DaasRuntimeDiagnostics {
	/** @param {object} dependencies Runtime systems whose public snapshots form diagnostics. */
	constructor(dependencies) {
		this.snapshots = dependencies.snapshots;
		this.sceneVessel = dependencies.sceneVessel;
		this.camera = dependencies.camera;
		this.effects = dependencies.effects;
		this.world = dependencies.world;
		this.model = dependencies.model;
	}

	/** @returns {object} Current advanced runtime evidence. */
	snapshot() {
		const renderer = this.sceneVessel.renderer;
		const stats = renderer?.stats || {};
		return {
			state: this.snapshots.compose(),
			camera: this.camera.snapshot(),
			effects: this.effects.diagnostics(),
			world: {
				proceduralMeshes: this.world.countProceduralMeshes(),
				turnPrompt: this.world.turnPrompt()
			},
			textures: this.world.meshFactory?.surfaces?.diagnostics?.() || null,
			model: {
				ready: Boolean(this.model?.root),
				animations: this.model?.animations?.length || 0
			},
			renderer: {
				calls: stats.calls || 0,
				triangles: stats.triangles || 0,
				geometries: stats.geometries || 0,
				textures: stats.textures || 0
			}
		};
	}
}
