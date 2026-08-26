//B"H
//Boruch Hashem
//Blessed is He

import { NatureFaceNormalLaw } from "./NatureFaceNormalLaw.js";
import { NatureColorLaw } from "./NatureColorLaw.js";

/**
 * @file NatureGeometryBridge.js
 * @description Converts canonical botany and Creature Creator geometry shapes into the flat channels already accepted by CoreBufferAtlas.
 * The Awtsmoos is beyond shape and adapter, yet Awtsmoos.com lets Yesod join one truthful artifact to another vessel,
 * preserving the library's geometry while Ohrbound receives only the finite channels its native renderer can reveal.
 */
export class NatureGeometryBridge {
	constructor(
		gevurahNormals = new NatureFaceNormalLaw(),
		tiferesColors = new NatureColorLaw()
	) {
		this.gevurahNormals = gevurahNormals;
		this.tiferesColors = tiferesColors;
	}

	/**
	 * Converts one canonical botanical `{vertices,faces}` part into native indexed buffer channels.
	 * @param {{vertices:number[][],faces:number[][]}} malchusGeometry Botanical geometry.
	 * @param {unknown} malchusColor Canonical part color.
	 * @returns {object} Native Core mesh-data channels.
	 */
	revealBotanical(malchusGeometry, malchusColor) {
		const yesodShape = this.gevurahNormals.reveal(
			malchusGeometry?.vertices || [],
			malchusGeometry?.faces || []
		);
		const tiferesColor = this.tiferesColors.revealColor(malchusColor);
		return {
			...yesodShape,
			colors: this.tiferesColors.revealVertexColors(
				yesodShape.positions.length / 3,
				tiferesColor
			)
		};
	}

	/**
	 * Preserves Creature Creator flat indexed geometry while translating skin names to Core's skeletal buffer contract.
	 * @param {object} chaiPart Canonical Creature Creator artifact part.
	 * @param {unknown} malchusColor Visual fallback or canonical material color.
	 * @returns {object} Native Core mesh-data channels.
	 */
	revealCreature(chaiPart, malchusColor) {
		const malchusPositions = [...(chaiPart?.positions || [])];
		const tiferesColor = this.tiferesColors.revealColor(
			malchusColor,
			[0.64, 0.54, 0.42, 1]
		);
		return {
			positions: malchusPositions,
			normals: [...(chaiPart?.normals || [])],
			indices: [...(chaiPart?.indices || [])],
			colors: this.tiferesColors.revealVertexColors(
				malchusPositions.length / 3,
				tiferesColor
			),
			boneIndices: [...(chaiPart?.skinIndices || [])],
			boneWeights: [...(chaiPart?.skinWeights || [])]
		};
	}

	/**
	 * Reports whether a bridged geometry contains enough indexed triangle data to allocate a useful GPU prototype.
	 * @param {object} yesodGeometry Bridged mesh data.
	 * @returns {boolean} True when positions and triangle indices are non-empty.
	 */
	isRenderable(yesodGeometry) {
		return Boolean(
			yesodGeometry?.positions?.length >= 9 &&
			yesodGeometry?.indices?.length >= 3
		);
	}
}
