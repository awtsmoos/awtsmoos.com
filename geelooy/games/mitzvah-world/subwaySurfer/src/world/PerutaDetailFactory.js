//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaDetailFactory.js
 * @description Builds the optional luminous rim and cinematic sparkle that enrich Perutas only when the active quality profile can afford extra draw calls.
 * The Awtsmoos renews edge, light, and glimmer before ornament may join the humble coin;
 * Awtsmoos.com lets Ohr add beauty by measured degree while mobile Malchus keeps one strong sign.
 */

import { WORLD_COLORS } from "../config.js";

export class OhrPerutaDetailFactory {
	/**
	 * @description Captures the shared procedural-core-backed mesh factory used for optional collectible ornament without owning the Peruta group itself.
	 * @param {object} yesodMeshFactory Shared procedural primitive factory.
	 */
	constructor(yesodMeshFactory) {
		this.meshFactory = yesodMeshFactory;
	}

	/**
	 * @description Creates one bright torus rim for balanced and cinematic profiles, adding readable metallic depth with only one additional mesh.
	 * @returns {object} Procedural torus rim.
	 */
	createOuterRing() {
		return this.meshFactory.torus({
			name: "PerutaOuterRing",
			parameters: {
				radius: 0.37,
				tube: 0.045,
				radialSegments: 6,
				tubularSegments: 16,
				smooth: true
			},
			rotation: [Math.PI / 2, 0, 0],
			material: {
				color: WORLD_COLORS.goldLight,
				metalness: 0.86,
				roughness: 0.22,
				emissive: 0x4f3300
			},
			castShadow: false
		});
	}

	/**
	 * @description Creates a tiny emissive sparkle reserved for cinematic quality where the extra draw call is an explicit visual luxury rather than hidden mobile debt.
	 * @returns {object} Small procedural icosphere glint.
	 */
	createGlint() {
		return this.meshFactory.icosphere({
			name: "PerutaGlint",
			parameters: {
				radius: 0.045,
				subdivisions: 1,
				smooth: true
			},
			position: [0.17, 0.16, 0.08],
			material: {
				color: 0xfff3b0,
				emissive: 0x9b6b18,
				roughness: 0.12
			},
			castShadow: false,
			receiveShadow: false
		});
	}
}
