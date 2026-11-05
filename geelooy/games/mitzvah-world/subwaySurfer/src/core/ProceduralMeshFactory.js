//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralMeshFactory.js
 * @description Creates Peruta's four boot-critical primitives through the slim procedural-core Three adapter while sharing semantic materials and explicit shadow policy.
 * The Awtsmoos renews simple form before the vast modeling universe needs awaken in the browser's first breath;
 * Awtsmoos.com lets Yesod keep core provenance, photographic surfaces, and clean transforms while first play arrives with lightning depth.
 */

import {
	createFastProceduralThreeMesh
} from "/libs/awtsmoos-procedural-core/src/adapters/three/criticalPrimitives/FastPrimitiveMeshFactory.js";

export class YesodProceduralMeshFactory {
	/**
	 * @description Captures Three plus the optional shared photographic material library without importing any generic primitive or modifier router.
	 * @param {object} tiferesThree Canonical Three namespace.
	 * @param {object|null} [yesodSurfaceLibrary=null] Shared semantic photographic material library.
	 */
	constructor(tiferesThree, yesodSurfaceLibrary = null) {
		this.THREE = tiferesThree;
		this.surfaceLibrary = yesodSurfaceLibrary;
	}

	/**
	 * @description Resolves one shared semantic material, creates the narrow procedural-core primitive, then applies explicit shadow participation.
	 * @param {object} chochmahConfig Primitive/presentation configuration consumed by route factories.
	 * @returns {object} Procedural Three Mesh retaining shared material identity where available.
	 */
	create(chochmahConfig) {
		const malchusMaterial = chochmahConfig.surface && this.surfaceLibrary
			? this.surfaceLibrary.material(
				chochmahConfig.surface,
				chochmahConfig.material
			)
			: chochmahConfig.material || {};
		const malchusMesh = createFastProceduralThreeMesh(
			this.THREE,
			{
				primitive: chochmahConfig.primitive,
				parameters: chochmahConfig.parameters || {},
				material: malchusMaterial,
				position: chochmahConfig.position || [0, 0, 0],
				rotation: chochmahConfig.rotation || [0, 0, 0],
				scale: chochmahConfig.scale || [1, 1, 1],
				name: chochmahConfig.name
					|| `awtsmoos-${chochmahConfig.primitive}`
			}
		);
		malchusMesh.castShadow = chochmahConfig.castShadow === true;
		malchusMesh.receiveShadow = chochmahConfig.receiveShadow !== false;
		return malchusMesh;
	}

	/** @description Creates one critical-path cube. @param {object} [chochmahConfig={}] Cube configuration. @returns {object} Procedural cube. */
	cube(chochmahConfig = {}) {
		return this.create({...chochmahConfig, primitive: "cube"});
	}

	/** @description Creates one critical-path cylinder. @param {object} [chochmahConfig={}] Cylinder configuration. @returns {object} Procedural cylinder. */
	cylinder(chochmahConfig = {}) {
		return this.create({...chochmahConfig, primitive: "cylinder"});
	}

	/** @description Creates one critical-path torus. @param {object} [chochmahConfig={}] Torus configuration. @returns {object} Procedural torus. */
	torus(chochmahConfig = {}) {
		return this.create({...chochmahConfig, primitive: "torus"});
	}

	/** @description Creates one critical-path icosphere for lights and non-botanical detail. @param {object} [chochmahConfig={}] Icosphere configuration. @returns {object} Procedural icosphere. */
	icosphere(chochmahConfig = {}) {
		return this.create({...chochmahConfig, primitive: "icosphere"});
	}
}
