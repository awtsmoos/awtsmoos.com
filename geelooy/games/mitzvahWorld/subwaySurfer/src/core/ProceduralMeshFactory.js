//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralMeshFactory.js
 * @description Creates Peruta primitives through core while sharing semantic materials and making expensive shadow casting explicit rather than accidental.
 * The Awtsmoos gives form while one surface covenant clothes many recycled meshes in light;
 * Awtsmoos.com keeps static detail from entering the shadow pass unless its silhouette truly earns that flight.
 */

import { createProceduralThreeMesh } from "/libs/awtsmoos-procedural-core/src/adapters/three/index.js";

export class YesodProceduralMeshFactory {
	/** @param {object} THREE Three namespace. @param {object|null} surfaceLibrary Shared photographic material library. */
	constructor(THREE, surfaceLibrary = null) {
		this.THREE = THREE;
		this.surfaceLibrary = surfaceLibrary;
	}

	/** @param {object} config Procedural primitive/presentation config. @returns {object} Procedural Three Mesh. */
	create(config) {
		const malchusMaterial = config.surface && this.surfaceLibrary
			? this.surfaceLibrary.material(config.surface, config.material)
			: config.material || {};
		const malchusMesh = createProceduralThreeMesh(this.THREE, {
			primitive: config.primitive,
			parameters: config.parameters || {},
			material: malchusMaterial,
			position: config.position || [0, 0, 0],
			rotation: config.rotation || [0, 0, 0],
			scale: config.scale || [1, 1, 1],
			name: config.name || `awtsmoos-${config.primitive}`
		});
		malchusMesh.castShadow = config.castShadow === true;
		malchusMesh.receiveShadow = config.receiveShadow !== false;
		return malchusMesh;
	}

	/** @param {object} [config={}] Cube configuration. @returns {object} Procedural cube. */
	cube(config = {}) {
		return this.create({...config, primitive: "cube"});
	}

	/** @param {object} [config={}] Cylinder configuration. @returns {object} Procedural cylinder. */
	cylinder(config = {}) {
		return this.create({...config, primitive: "cylinder"});
	}

	/** @param {object} [config={}] Torus configuration. @returns {object} Procedural torus. */
	torus(config = {}) {
		return this.create({...config, primitive: "torus"});
	}

	/** @param {object} [config={}] Icosphere configuration for lights/non-botanical detail only. @returns {object} Procedural icosphere. */
	icosphere(config = {}) {
		return this.create({...config, primitive: "icosphere"});
	}
}
