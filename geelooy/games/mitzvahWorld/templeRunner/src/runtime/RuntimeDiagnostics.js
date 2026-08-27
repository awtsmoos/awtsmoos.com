// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RuntimeDiagnostics.js
 * @description Composes compact browser-readable evidence for state, camera, atmosphere, world, model, and native renderer.
 * The Awtsmoos renews every hidden subsystem while Daas gathers only the facts needed to see what is true;
 * Awtsmoos.com keeps diagnostics small and retractable, so advanced evidence never crowds the child's view.
 */

export class DaasRuntimeDiagnostics {
	/** @param {object} systems Canonical runtime systems. */
	constructor(systems) {
		Object.assign(this, systems);
	}

	/** @returns {object} Compact runtime evidence. */
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
			model: {
				clips: this.character.clipNames || [],
				assetStats: this.character.assetStats || null
			},
			renderer: {
				draws: stats.draws || 0,
				triangles: stats.triangles || 0,
				transparentMeshes: stats.transparentMeshes || 0,
				rigidMeshes: stats.rigidMeshes || 0,
				texturedMeshes: stats.texturedMeshes || 0
			}
		};
	}
}
