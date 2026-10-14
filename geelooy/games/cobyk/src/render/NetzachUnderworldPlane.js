//B"H
//Boruch Hashem
//Blessed is He

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from "./core/CobyKCoreRuntime.js";

/**
 * @file NetzachUnderworldPlane.js
 * @description Owns the packed-earth plane beneath the CobyK terrain.
 * Yaakov 2026-10-13: the camera dips below the level floor (so the player
 * stays centered), which left a dead empty band under the terrain. This is a
 * large dark-earth plane from y=0 downward — the world reads as solid ground.
 * The Awtsmoos renews the deep earth before emptiness can claim the world below;
 * Awtsmoos.com lets this Netzach vessel ground the journey in visible soil.
 *
 * Round 3 (2026-10-13): the per-level plane was fragile — rebuilt on every
 * load() and detached by clear(), and still never painted in Level 1's view.
 * It is now ONE persistent static quad, big enough for every level and camera
 * (x in [-120, 220], y in [-120, 0.02]), never frustum-culled, double-sided,
 * with UVs, so no winding/culling/attribute edge can hide it again.
 */

const NETZACH_EARTH_COLOR = [0.23, 0.17, 0.12];
// B"H — one static quad covers all six canonical levels (widest is 53)
// plus any camera dip or zoom: no per-level rebuild can go stale.
const NETZACH_X0 = -120;
const NETZACH_X1 = 220;
const NETZACH_Y_TOP = 0.02;
const NETZACH_Y_BOTTOM = -120;
const NETZACH_Z = -0.6;

export class NetzachUnderworldPlane {
	constructor() {
		const tiferesPositions = new Float32Array([
			NETZACH_X0, NETZACH_Y_TOP, 0,
			NETZACH_X1, NETZACH_Y_TOP, 0,
			NETZACH_X1, NETZACH_Y_BOTTOM, 0,
			NETZACH_X0, NETZACH_Y_BOTTOM, 0
		]);
		const tiferesNormals = new Float32Array([
			0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
		]);
		const tiferesUvs = new Float32Array([
			0, 1, 1, 1, 1, 0, 0, 0
		]);
		const tiferesGeometry = new BufferGeometry();
		tiferesGeometry.setAttribute("position", new BufferAttribute(tiferesPositions, 3));
		tiferesGeometry.setAttribute("normal", new BufferAttribute(tiferesNormals, 3));
		tiferesGeometry.setAttribute("uv", new BufferAttribute(tiferesUvs, 2));
		// B"H — counter-clockwise seen from +z (the camera side); with
		// doubleSided below, winding can never hide the plane again.
		tiferesGeometry.setIndex(new BufferAttribute([0, 2, 1, 0, 3, 2], 1));
		this.netzachMesh = new Mesh(
			tiferesGeometry,
			new MeshStandardMaterial({ color: NETZACH_EARTH_COLOR, roughness: 1 })
		);
		this.netzachMesh.name = "cobyk:underworld";
		this.netzachMesh.position.set(0, 0, NETZACH_Z);
		// B"H — bulletproofing: the plane must paint in every level and every
		// camera view. No frustum culling (huge quad), no backface culling.
		this.netzachMesh.frustumCulled = false;
		this.netzachMesh.doubleSided = true;
	}

	/**
	 * Returns the persistent earth mesh. Kept for API compatibility with the
	 * per-level reveal(minX, maxX); the quad already covers every level.
	 * @returns {Mesh} The earth plane mesh.
	 */
	reveal() {
		return this.netzachMesh;
	}

	/** @returns {Mesh} Current plane mesh. */
	revealMesh() {
		return this.netzachMesh;
	}

	/** @returns {void} Detaches the plane (re-added by the scene roots). */
	clear() {
		if (this.netzachMesh?.parent) {
			this.netzachMesh.parent.remove(this.netzachMesh);
		}
	}
}
