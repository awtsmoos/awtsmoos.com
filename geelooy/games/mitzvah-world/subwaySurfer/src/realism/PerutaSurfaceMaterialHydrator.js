//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaSurfaceMaterialHydrator.js
 * @description Owns Three material construction and image-to-texture hydration so semantic registry orchestration can remain independent from renderer-specific texture mutation.
 * The Awtsmoos renews color, image, wrapping, light response, and leaf transparency before any material can clothe the street;
 * Awtsmoos.com lets Tiferes join fallback and photograph in one shared vessel while cached source ownership remains discreet.
 */

export class TiferesPerutaSurfaceMaterialHydrator {
	/**
	 * @description Captures Three and renderer capability evidence used to build shared materials and bound texture anisotropy safely.
	 * @param {object} tiferesThree Canonical Three namespace.
	 * @param {object} malchusRenderer Active renderer whose capabilities bound anisotropic sampling cost.
	 */
	constructor(tiferesThree, malchusRenderer) {
		this.THREE = tiferesThree;
		this.renderer = malchusRenderer;
	}

	/**
	 * @description Creates one shared semantic material, applying transparent double-sided leaf policy only when the registry definition explicitly marks foliage.
	 * @param {string} yesodRole Stable semantic surface role used in diagnostic material names.
	 * @param {Readonly<object>} binahDefinition Surface color, roughness, metalness, repeat, and optional leaf policy.
	 * @returns {object} Shared Three MeshStandardMaterial ready for fallback rendering and later photographic hydration.
	 */
	createRoleMaterial(yesodRole, binahDefinition) {
		const malchusMaterial = this.createMaterial(
			`PerutaSurface:${yesodRole}`,
			binahDefinition
		);
		if (binahDefinition.leaf) {
			malchusMaterial.vertexColors = true;
			malchusMaterial.side = this.THREE.DoubleSide;
			malchusMaterial.transparent = true;
			malchusMaterial.alphaTest = 0.34;
			malchusMaterial.depthWrite = false;
		}
		return malchusMaterial;
	}

	/**
	 * @description Creates an unhydrated physically based material used either as a semantic fallback or as the stable object later receiving a cached photographic map.
	 * @param {string} malchusName Diagnostic material name.
	 * @param {object} chochmahConfig Optional color, roughness, and metalness values.
	 * @returns {object} Three MeshStandardMaterial with bounded defaults.
	 */
	createMaterial(malchusName, chochmahConfig = {}) {
		return new this.THREE.MeshStandardMaterial({
			name: malchusName,
			color: chochmahConfig.color ?? 0xffffff,
			roughness: chochmahConfig.roughness ?? 0.82,
			metalness: chochmahConfig.metalness ?? 0
		});
	}

	/**
	  * @description Wraps one already-decoded shared image in a route-owned Three Texture, applies repeat/color-space/anisotropy policy,
	  * then hydrates the existing shared material in place.
	 * @param {string} yesodRole Stable semantic role used for texture diagnostics.
	 * @param {object} malchusMaterial Existing shared material receiving the photographic map.
	 * @param {Readonly<object>} binahDefinition Surface definition containing UV repeat values.
	 * @param {CanvasImageSource} ohrImage Decoded image shared by procedural-core cache ownership.
	 * @returns {object} Hydrated Three texture now assigned to the material.
	 */
	hydrate(yesodRole, malchusMaterial, binahDefinition, ohrImage) {
		const ohrTexture = new this.THREE.Texture(ohrImage);
		ohrTexture.name = `PerutaCachedTexture:${yesodRole}`;
		ohrTexture.wrapS = this.THREE.RepeatWrapping;
		ohrTexture.wrapT = this.THREE.RepeatWrapping;
		ohrTexture.repeat.set(...binahDefinition.repeat);
		ohrTexture.colorSpace = this.THREE.SRGBColorSpace;
		ohrTexture.anisotropy = Math.min(
			4,
			this.renderer.capabilities?.getMaxAnisotropy?.() || 1
		);
		ohrTexture.needsUpdate = true;
		malchusMaterial.map = ohrTexture;
		malchusMaterial.needsUpdate = true;
		return ohrTexture;
	}
}
