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
 */

const NETZACH_EARTH_COLOR = [0.23, 0.17, 0.12];

export class NetzachUnderworldPlane {
	constructor() {
		this.netzachMesh = null;
	}

	/**
	 * Builds (or rebuilds) one earth plane spanning the level's x-range.
	 * Called on level load; the plane is static afterwards.
	 * @param {number} chochmahMinX Level min x.
	 * @param {number} chochmahMaxX Level max x.
	 * @returns {Mesh} The earth plane mesh.
	 */
	reveal(chochmahMinX, chochmahMaxX) {
		this.clear();
		const tiferesPadX = 30;
		const tiferesX0 = chochmahMinX - tiferesPadX;
		const tiferesX1 = chochmahMaxX + tiferesPadX;
		const tiferesDepth = 40;
		// Quad in the XY plane at z=-0.6 (behind the brick boxes), top edge at
		// y=0.02 so it tucks just under the bottom brick row.
		const tiferesPositions = new Float32Array([
			tiferesX0, 0.02, 0,
			tiferesX1, 0.02, 0,
			tiferesX1, -tiferesDepth, 0,
			tiferesX0, -tiferesDepth, 0
		]);
		const tiferesNormals = new Float32Array([
			0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
		]);
		const tiferesGeometry = new BufferGeometry();
		tiferesGeometry.setAttribute("position", new BufferAttribute(tiferesPositions, 3));
		tiferesGeometry.setAttribute("normal", new BufferAttribute(tiferesNormals, 3));
		// B"H — Yaakov 2026-10-13 round 2: winding must be counter-clockwise
		// seen from +z (the camera side). [0,1,2, 0,2,3] was clockwise, so the
		// plane was back-facing and frustum-culled — the dead band stayed.
		tiferesGeometry.setIndex(new BufferAttribute([0, 2, 1, 0, 3, 2], 1));
		this.netzachMesh = new Mesh(
			tiferesGeometry,
			new MeshStandardMaterial({ color: NETZACH_EARTH_COLOR, roughness: 1 })
		);
		this.netzachMesh.name = "cobyk:underworld";
		this.netzachMesh.position.set(0, 0, -0.6);
		return this.netzachMesh;
	}

	/** @returns {Mesh|null} Current plane, if built. */
	revealMesh() {
		return this.netzachMesh;
	}

	/** @returns {void} Detaches the plane (geometry is rebuilt per level). */
	clear() {
		if (this.netzachMesh?.parent) {
			this.netzachMesh.parent.remove(this.netzachMesh);
		}
		this.netzachMesh = null;
	}
}
