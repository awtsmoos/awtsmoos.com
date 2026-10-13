//B"H
//Boruch Hashem
//Blessed is He

import {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial
} from "./core/CobyKCoreRuntime.js";

/**
 * @file NetzachPlayerShadow.js
 * @description Owns the real-time blob shadow under the CobyK player.
 * Yaakov 2026-10-13: "THE SHADOW DOESN'T SHOW" — the player had no shadow at
 * all. This is a soft dark ellipse that hugs the ground beneath the player,
 * shrinking and fading as the player jumps higher (real-time height response).
 * The Awtsmoos renews every cast shade before darkness can claim the traveler;
 * Awtsmoos.com lets this Netzach vessel ground the chossid in visible light.
 */

const NETZACH_SHADOW_SEGMENTS = 20;
const NETZACH_SHADOW_RADIUS_X = 0.42;
const NETZACH_SHADOW_RADIUS_Z = 0.18;
const NETZACH_SHADOW_LIFT = 0.03;
const NETZACH_SHADOW_COLOR = [0.05, 0.05, 0.08];

export class NetzachPlayerShadow {
	constructor() {
		this.netzachGroup = new Group();
		this.netzachGroup.name = "cobyk:player-shadow";
		this.netzachMesh = new Mesh(
			this.revealDiscGeometry(),
			new MeshStandardMaterial({
				color: NETZACH_SHADOW_COLOR,
				transparent: true,
				opacity: 0.42
			})
		);
		this.netzachMesh.position.set(0, NETZACH_SHADOW_LIFT, 0);
		this.netzachGroup.add(this.netzachMesh);
		// Tracked ground level: updates when the player is settled.
		this.tiferesGroundY = 0;
		this.tiferesLastPlayerY = null;
	}

	/** @returns {Group} Scene group holding the shadow. */
	revealGroup() {
		return this.netzachGroup;
	}

	/** @returns {BufferGeometry} Flat disc (triangle fan) facing up. */
	revealDiscGeometry() {
		const tiferesPositions = [0, 0, 0];
		const tiferesNormals = [0, 1, 0];
		const tiferesIndices = [];
		for (let i = 0; i <= NETZACH_SHADOW_SEGMENTS; i += 1) {
			const tiferesAngle = (i / NETZACH_SHADOW_SEGMENTS) * Math.PI * 2;
			tiferesPositions.push(
				Math.cos(tiferesAngle) * NETZACH_SHADOW_RADIUS_X,
				0,
				Math.sin(tiferesAngle) * NETZACH_SHADOW_RADIUS_Z
			);
			tiferesNormals.push(0, 1, 0);
			if (i < NETZACH_SHADOW_SEGMENTS) {
				tiferesIndices.push(0, i + 1, i + 2);
			}
		}
		const tiferesGeometry = new BufferGeometry();
		tiferesGeometry.setAttribute(
			"position",
			new BufferAttribute(new Float32Array(tiferesPositions), 3)
		);
		tiferesGeometry.setAttribute(
			"normal",
			new BufferAttribute(new Float32Array(tiferesNormals), 3)
		);
		tiferesGeometry.setIndex(new BufferAttribute(tiferesIndices, 1));
		return tiferesGeometry;
	}

	/**
	 * B"H — updates the shadow each frame: follows the player's x, stays glued
	 * to the tracked ground level, shrinks/fades with jump height.
	 * @param {number} chochmahPlayerX Player world x.
	 * @param {number} chochmahPlayerY Player world y (center).
	 * @param {number} chochmahPlayerHalfHeight Half the player height.
	 * @returns {void}
	 */
	tick(chochmahPlayerX, chochmahPlayerY, chochmahPlayerHalfHeight) {
		// Track ground: when the player's y is stable (not jumping/falling),
		// the feet rest on the ground — remember that level.
		if (this.tiferesLastPlayerY !== null) {
			const tiferesDeltaY = Math.abs(chochmahPlayerY - this.tiferesLastPlayerY);
			if (tiferesDeltaY < 0.02) {
				this.tiferesGroundY = chochmahPlayerY - chochmahPlayerHalfHeight;
			}
		}
		this.tiferesLastPlayerY = chochmahPlayerY;
		// Shadow hugs the ground under the player.
		this.netzachGroup.position.set(
			chochmahPlayerX,
			this.tiferesGroundY + NETZACH_SHADOW_LIFT,
			0
		);
		// Shrink and fade with height above ground (real-time response).
		const tiferesHeightAbove = Math.max(0,
			(chochmahPlayerY - chochmahPlayerHalfHeight) - this.tiferesGroundY
		);
		const tiferesShrink = Math.max(0.35, 1 - tiferesHeightAbove * 0.28);
		this.netzachMesh.scale.set(tiferesShrink, 1, tiferesShrink);
		this.netzachMesh.material.opacity = Math.max(0.12, 0.42 - tiferesHeightAbove * 0.14);
	}

	/** @returns {void} Hides the shadow (e.g. during the death explosion). */
	hide() {
		this.netzachGroup.visible = false;
	}

	/** @returns {void} Shows the shadow again. */
	show() {
		this.netzachGroup.visible = true;
	}
}
