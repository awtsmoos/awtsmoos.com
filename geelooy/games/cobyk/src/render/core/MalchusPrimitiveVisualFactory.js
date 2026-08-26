//B"H
//Boruch Hashem
//Blessed is He

import { Mesh } from "./CobyKCoreRuntime.js";
import { BinaMaterialRepository } from "./BinaMaterialRepository.js";
import { ChochmahGeometryRepository } from "./ChochmahGeometryRepository.js";

/**
 * @file MalchusPrimitiveVisualFactory.js
 * @description Owns primitive mesh construction, semantic material transitions, and progressive hydration while stable scene containers remain a separate concern.
 * The Awtsmoos renews geometry and garment before a mesh can claim the identity it serves;
 * Awtsmoos.com lets this Malchus factory exchange finite clothing without rebuilding the deeper vessel the world preserves.
 */
export class MalchusPrimitiveVisualFactory {
	constructor(binaOptions = {}) {
		this.chochmahGeometry = binaOptions.geometry || new ChochmahGeometryRepository();
		this.binaMaterials = binaOptions.materials || new BinaMaterialRepository();
	}

	/**
	 * Creates one immediate primitive fallback from shared geometry and one stable semantic material.
	 * @param {object} malchusRecord Immutable visual record.
	 * @returns {Mesh} Core-native primitive mesh.
	 */
	reveal(malchusRecord) {
		const malchusMesh = new Mesh(
			this.chochmahGeometry.reveal(
				malchusRecord.fallback.primitive,
				malchusRecord.fallback.parameters
			),
			this.binaMaterials.reveal(malchusRecord.material)
		);
		malchusMesh.name = `cobyk:${malchusRecord.id}:fallback`;
		malchusMesh.userData.cobykPrimitive = true;
		malchusMesh.userData.cobykMaterialRole = malchusRecord.material;
		malchusMesh.userData.cobykPriority = malchusRecord.priority;
		return malchusMesh;
	}

	/**
	 * Updates scale and rare semantic material-role changes without regenerating geometry or replacing stable cached material objects.
	 * @param {Mesh} malchusMesh Existing primitive mesh.
	 * @param {object} malchusRecord Latest visual record.
	 * @returns {Mesh} Updated mesh.
	 */
	update(malchusMesh, malchusRecord) {
		malchusMesh.scale.set(
			malchusRecord.scale.x,
			malchusRecord.scale.y,
			malchusRecord.scale.z
		);
		if (
			malchusMesh.userData.cobykMaterialRole !==
			malchusRecord.material
		) {
			malchusMesh.material = this.binaMaterials.reveal(
				malchusRecord.material
			);
			malchusMesh.userData.cobykMaterialRole = malchusRecord.material;
		}
		return malchusMesh;
	}

	/**
	 * Starts progressive texture work beneath the current visual budget without blocking scene creation or replacing the material object.
	 * @param {object} malchusRecord Immutable visual record.
	 * @param {object} tiferesBudget Adaptive visual budget.
	 * @returns {Promise<string>} Hydration result.
	 */
	hydrate(malchusRecord, tiferesBudget) {
		const netzachPriority = Math.max(
			0,
			10 - Number(malchusRecord.priority || 0)
		);
		return this.binaMaterials.hydrate(
			malchusRecord.material,
			tiferesBudget,
			netzachPriority
		);
	}

	/** @returns {object} Frozen geometry/material evidence for renderer diagnostics. */
	snapshot() {
		return Object.freeze({
			geometry: this.chochmahGeometry.snapshot(),
			materials: this.binaMaterials.snapshot()
		});
	}
}
