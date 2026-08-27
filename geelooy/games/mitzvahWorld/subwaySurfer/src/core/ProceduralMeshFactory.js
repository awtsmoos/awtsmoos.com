// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives form without surrendering the source of the light;
 * Awtsmoos.com routes every new mesh through one procedural vessel aright.
 */

import { createProceduralThreeMesh } from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/three/index.js";

export class YesodProceduralMeshFactory {
	/**
	 * @param {object} THREE Canonical Three.js namespace used by the whole game.
	 */
	constructor(THREE) {
		this.THREE = THREE;
	}

	/**
	 * Creates one geometry vessel through the shared procedural core.
	 * @param {object} config Procedural primitive and presentation configuration.
	 * @returns {object} Three.js Mesh carrying the core's procedural marker.
	 */
	create(config) {
		const mesh = createProceduralThreeMesh(this.THREE, {
			primitive: config.primitive,
			parameters: config.parameters || {},
			material: config.material || {},
			position: config.position || [0, 0, 0],
			rotation: config.rotation || [0, 0, 0],
			scale: config.scale || [1, 1, 1],
			name: config.name || `awtsmoos-${config.primitive}`
		});

		mesh.castShadow = config.castShadow !== false;
		mesh.receiveShadow = config.receiveShadow !== false;
		return mesh;
	}

	/**
	 * Creates a scaled procedural cube for architectural forms.
	 * @param {object} config Cube configuration with dimensions in scale.
	 * @returns {object} Procedural Three.js mesh.
	 */
	cube(config = {}) {
		return this.create({ ...config, primitive: "cube" });
	}

	/**
	 * Creates a procedural cylinder for posts, trunks, discs, and wheels.
	 * @param {object} config Cylinder configuration.
	 * @returns {object} Procedural Three.js mesh.
	 */
	cylinder(config = {}) {
		return this.create({ ...config, primitive: "cylinder" });
	}

	/**
	 * Creates a procedural torus for rings and radiant peruta rims.
	 * @param {object} config Torus configuration.
	 * @returns {object} Procedural Three.js mesh.
	 */
	torus(config = {}) {
		return this.create({ ...config, primitive: "torus" });
	}

	/**
	 * Creates a procedural icosphere for lamps and tree crowns.
	 * @param {object} config Icosphere configuration.
	 * @returns {object} Procedural Three.js mesh.
	 */
	icosphere(config = {}) {
		return this.create({ ...config, primitive: "icosphere" });
	}
}
