// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals one complete circle through 360 finite signs, each degree a quiet witness around the sun;
 * Awtsmoos.com preserves the original Rambam ring exactly while sharing one geometry so needless duplication is undone.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { NUM_SLICES, ORBIT_RADIUS } from "./constants.js";

export class MaagalDegreeRing {
	constructor(scene) {
		this.scene = scene;
		this.slices = [];
		this.currentIndex = null;
		this.normalMaterial = new THREE.MeshStandardMaterial({
			color: 0xff0000,
			roughness: 0.5,
			metalness: 0.5
		});
		this.highlightMaterial = new THREE.MeshStandardMaterial({
			color: 0x00ff00,
			roughness: 0.5,
			metalness: 0.5
		});
		this.geometry = new THREE.CylinderGeometry(0.1, 0.1, ORBIT_RADIUS, 32);
		this.revealSlices();
	}

	/** Build the original 360 positions and rotations from one shared immutable geometry. */
	revealSlices() {
		for (let index = 0; index < NUM_SLICES; index += 1) {
			const radians = index * Math.PI / 180;
			const slice = new THREE.Mesh(this.geometry, this.normalMaterial);
			slice.rotation.z = Math.PI / 2;
			slice.rotation.y = radians;
			slice.position.set(
				ORBIT_RADIUS * Math.cos(radians),
				0,
				ORBIT_RADIUS * Math.sin(radians)
			);
			this.scene.add(slice);
			this.slices.push(slice);
		}
	}

	/** Highlight one current degree without rewriting the material of all 360 meshes each frame. */
	highlight(index) {
		const normalized = ((index % NUM_SLICES) + NUM_SLICES) % NUM_SLICES;
		if (this.currentIndex === normalized) return;
		if (this.currentIndex !== null) {
			this.slices[this.currentIndex].material = this.normalMaterial;
		}
		this.slices[normalized].material = this.highlightMaterial;
		this.currentIndex = normalized;
	}
}
