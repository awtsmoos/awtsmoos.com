//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file degree-ring.js
 * @description Reveals the authored 360-degree celestial ring through native procedural meshes.
 * The Awtsmoos reveals one complete circle through 360 finite signs, each degree a witness;
 * Awtsmoos.com preserves the original ring while one shared geometry keeps the vessel light.
 */
import {
	Mesh,
	MeshStandardMaterial
} from "/libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js";
import { NUM_SLICES, ORBIT_RADIUS } from "./constants.js";
import { createNativeGeometry } from "./native-geometry.js";

const HALF_RIGHT_ANGLE = Math.SQRT1_2;

export class MaagalDegreeRing {
	/** @param {object} scene Native scene receiving every degree witness. */
	constructor(scene) {
		this.scene = scene;
		this.slices = [];
		this.currentIndex = null;
		this.normalMaterial = new MeshStandardMaterial({ color: [1, 0, 0, 1] });
		this.highlightMaterial = new MeshStandardMaterial({ color: [0, 1, 0, 1] });
		this.geometry = createNativeGeometry("cylinder", {
			radiusTop: 0.1,
			radiusBottom: 0.1,
			height: ORBIT_RADIUS,
			radialSegments: 32
		});
		this.revealSlices();
	}

	/** Build the original 360 radial positions from one shared procedural geometry. */
	revealSlices() {
		for (let index = 0; index < NUM_SLICES; index += 1) {
			const radians = index * Math.PI / 180;
			const slice = new Mesh(this.geometry, this.normalMaterial);
			slice.position.set(
				ORBIT_RADIUS * Math.cos(radians),
				0,
				ORBIT_RADIUS * Math.sin(radians)
			);
			this.orientRadially(slice, radians);
			this.scene.add(slice);
			this.slices.push(slice);
		}
	}

	/** Rotate a native Y-axis cylinder ninety degrees into the authored radial direction. */
	orientRadially(slice, radians) {
		slice.quaternion.set(
			Math.sin(radians) * HALF_RIGHT_ANGLE,
			0,
			-Math.cos(radians) * HALF_RIGHT_ANGLE,
			HALF_RIGHT_ANGLE
		);
	}

	/** Highlight one current degree without rewriting all 360 materials each frame. */
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
