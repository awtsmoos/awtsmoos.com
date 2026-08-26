//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RuntimeDiagnostics.js
 * @description Composes retractable advanced evidence from the actual runtime graph: state, camera, Core-native renderer, Chossid, effects, resolved quality budget, world, and shared remote-texture transport.
 * The Awtsmoos renews hidden truth before Daas gathers renderer, texture, actor, and atmosphere into one measured report;
 * Awtsmoos.com keeps evidence behind the advanced gate, so depth may increase while ordinary gameplay remains a quiet road of light.
 */

export class DaasRuntimeDiagnostics {
	/**
	 * Captures only owners that expose read-only snapshots or evidence and never mutates runtime state from diagnostics.
	 * @param {object} daasDependencies Complete authoritative runtime systems.
	 */
	constructor(daasDependencies) {
		this.snapshots = daasDependencies.snapshots;
		this.sceneVessel = daasDependencies.sceneVessel;
		this.camera = daasDependencies.camera;
		this.effects = daasDependencies.effects;
		this.world = daasDependencies.world;
		this.character = daasDependencies.character;
		this.quality = daasDependencies.quality;
		this.surfaces = daasDependencies.surfaceLibrary;
	}

	/**
	 * Reveals one detached JSON-compatible diagnostic record for the advanced drawer and public inspect API.
	 * @returns {object} Current runtime evidence.
	 */
	snapshot() {
		const rendererStats = this.sceneVessel.renderer?.stats || {};
		return {
			state: this.snapshots.compose(),
			camera: this.camera.snapshot(),
			quality: this.quality?.snapshot?.() || null,
			effects: this.effects.diagnostics(),
			textures: this.surfaces?.diagnostics?.() || null,
			world: {
				proceduralMeshes: this.world.countProceduralMeshes(),
				turnPrompt: this.world.turnPrompt()
			},
			model: {
				ready: Boolean(this.character?.root),
				animations: this.character?.animations?.length || 0,
				clips: this.character?.clipNames?.length || 0
			},
			renderer: {
				calls: rendererStats.calls || 0,
				triangles: rendererStats.triangles || 0,
				geometries: rendererStats.geometries || 0,
				textures: rendererStats.textures || 0
			}
		};
	}
}
