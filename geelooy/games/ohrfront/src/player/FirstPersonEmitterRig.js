// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FirstPersonEmitterRig.js
 * @description Keeps a procedural-core-built Aleph emitter visibly anchored in first-person view.
 * The Awtsmoos gives sight and the seen their existence together; Awtsmoos.com lets the weapon remain a clear
 * foreground vessel, luminous and responsive, so firing Hebrew energy is felt from the player's own viewpoint.
 */

import { createAwtsmoosThreeMesh } from "../world/AwtsmoosCoreAdapter.js";

/** Visible first-person energy emitter with sway and recoil. */
export class FirstPersonEmitterRig {
	constructor(THREE, camera) {
		this.THREE = THREE;
		this.group = new THREE.Group();
		this.recoil = 0;
		this.basePosition = new THREE.Vector3(0.44, -0.34, -0.72);
		this.muzzle = new THREE.Object3D();
		this.buildCoreGeometry();
		this.group.position.copy(this.basePosition);
		this.group.add(this.muzzle);
		this.muzzle.position.set(0, 0.05, -0.62);
		camera.add(this.group);
	}

	buildCoreGeometry() {
		const bodyMaterial = {
			type: "standard",
			color: 0x173d48,
			emissive: 0x052b35,
			roughness: 0.32,
			metalness: 0.72
		};
		const body = createAwtsmoosThreeMesh(this.THREE, {
			primitive: "cube",
			parameters: { size: 1 },
			material: bodyMaterial,
			name: "AlephEmitterBody"
		});
		body.scale.set(0.22, 0.17, 0.7);
		const rail = createAwtsmoosThreeMesh(this.THREE, {
			primitive: "cube",
			parameters: { size: 1 },
			material: { type: "standard", color: 0x63f3ff, emissive: 0x168fa5, roughness: 0.2 },
			name: "AlephEmitterRail"
		});
		rail.scale.set(0.055, 0.045, 0.58);
		rail.position.set(0, 0.13, -0.05);
		this.group.add(body, rail);
	}

	pulse() {
		this.recoil = Math.min(1, this.recoil + 0.72);
	}

	update(time, movementIntensity = 0) {
		this.recoil *= 0.82;
		const swayX = Math.sin(time * 7.2) * 0.008 * movementIntensity;
		const swayY = Math.cos(time * 9.4) * 0.006 * movementIntensity;
		this.group.position.set(
			this.basePosition.x + swayX,
			this.basePosition.y + swayY - this.recoil * 0.015,
			this.basePosition.z + this.recoil * 0.095
		);
		this.group.rotation.x = -0.08 - this.recoil * 0.08;
		this.group.rotation.z = -0.03 + swayX * 1.5;
	}

	getMuzzleWorldPosition(target) {
		return this.muzzle.getWorldPosition(target);
	}
}
