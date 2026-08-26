//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ObstacleFamilyFactory.js
 * @description Defines the truthful shared visual-construction covenant inherited by thematic Peruta obstacle families.
 * The Awtsmoos renews cube, wheel, cloth, and stone while the family gives each form a finite role;
 * Awtsmoos.com lets Gevurah share one measured vessel so themed children remain clear as a whole.
 */

import { BinahObstacleVariantDescriptor } from "./ObstacleVariantDescriptor.js";

export class GevurahObstacleFamilyFactory {
	/**
	 * @param {object} THREE Three namespace used for lightweight Group ownership.
	 * @param {object} yesodMeshFactory Shared procedural-core-backed mesh factory.
	 * @param {string} malchusFamily Stable thematic family id.
	 */
	constructor(THREE, yesodMeshFactory, malchusFamily) {
		this.THREE = THREE;
		this.meshFactory = yesodMeshFactory;
		this.family = malchusFamily;
	}

	/**
	 * Creates a named scene-group template with no runtime behavior.
	 * @param {string} malchusName Diagnostic group name.
	 * @returns {object} New Three Group.
	 */
	group(malchusName) {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.name = malchusName;
		return malchusRoot;
	}

	/**
	 * Creates a broad low-cost procedural box that never enters the shadow-caster pass by default.
	 * @param {object} binahConfig Mesh name, transform, surface role, and fallback material.
	 * @returns {object} Procedural Three mesh.
	 */
	box(binahConfig) {
		return this.meshFactory.cube({
			name: binahConfig.name,
			scale: binahConfig.scale,
			position: binahConfig.position || [0, 0, 0],
			rotation: binahConfig.rotation || [0, 0, 0],
			surface: binahConfig.surface,
			material: binahConfig.material,
			castShadow: false,
			receiveShadow: binahConfig.receiveShadow !== false
		});
	}

	/**
	 * Creates a low-segment procedural cylinder for wheels, spools, or utility hardware.
	 * @param {object} binahConfig Cylinder transform and material description.
	 * @returns {object} Procedural Three cylinder mesh.
	 */
	cylinder(binahConfig) {
		return this.meshFactory.cylinder({
			name: binahConfig.name,
			parameters: {
				radiusTop: binahConfig.radius,
				radiusBottom: binahConfig.radius,
				height: binahConfig.height,
				radialSegments: binahConfig.radialSegments || 8,
				smooth: true
			},
			position: binahConfig.position || [0, 0, 0],
			rotation: binahConfig.rotation || [0, 0, 0],
			surface: binahConfig.surface,
			material: binahConfig.material,
			castShadow: false,
			receiveShadow: binahConfig.receiveShadow !== false
		});
	}

	/**
	 * Wraps one finished family template in the renderer-neutral collision descriptor.
	 * @param {object} chochmahConfig Variant id, law, template, and dimensions.
	 * @returns {BinahObstacleVariantDescriptor} Immutable descriptor.
	 */
	descriptor(chochmahConfig) {
		return new BinahObstacleVariantDescriptor({
			...chochmahConfig,
			family: this.family
		});
	}
}
