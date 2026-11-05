//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RuntimeDiagnostics.js
 * @description Composes retractable advanced evidence from actual runtime owners: state, camera, renderer, Chossid, effects, quality, world, remote textures, and browser connectivity hints.
 * The Awtsmoos renews hidden truth before Daas gathers renderer, texture, actor, atmosphere, and network witness into one measured report;
 * Awtsmoos.com keeps evidence behind the advanced gate, so depth may increase while ordinary gameplay remains a quiet road of light.
 */

export class DaasRuntimeDiagnostics {
	/**
	 * @description Captures only runtime owners that expose read-only snapshots or evidence and never mutates gameplay, transport, browser, or renderer state from diagnostics.
	 * @param {object} daasDependencies Complete authoritative runtime systems.
	 * @returns {void}
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
		this.network = daasDependencies.network;
	}

	/**
	 * @description Reveals one detached JSON-compatible diagnostic record for the advanced drawer and public inspect API without exposing mutable subsystem references.
	 * @returns {object} Current runtime evidence including browser network hints when supported.
	 */
	snapshot() {
		const binahRendererStats = this.sceneVessel.renderer?.stats || {};
		return {
			state: this.snapshots.compose(),
			camera: this.camera.snapshot(),
			quality: this.quality?.snapshot?.() || null,
			network: this.network?.snapshot?.() || null,
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
				calls: binahRendererStats.calls || 0,
				triangles: binahRendererStats.triangles || 0,
				geometries: binahRendererStats.geometries || 0,
				textures: binahRendererStats.textures || 0
			}
		};
	}
}
