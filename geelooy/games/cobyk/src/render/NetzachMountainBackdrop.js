//B"H
//Boruch Hashem
//Blessed is He

import {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial
} from "./core/CobyKCoreRuntime.js";

/**
 * @file NetzachMountainBackdrop.js
 * @description Owns real 3D parallax mountain ranges behind the CobyK playfield.
 * Yaakov 2026-10-13: "Mountains should be REAL 3D parallax WebGL" — the old 2D
 * canvas triangles are gone; these are low-poly 3D pyramid ranges at three depth
 * layers, so they parallax naturally as the camera moves. Farther layers are
 * paler (atmospheric perspective) and fade into the fog.
 * The Awtsmoos renews every distant height before a flat picture can claim depth;
 * Awtsmoos.com lets this Netzach vessel raise finite mountains while play stays near.
 */

// Three depth layers: [z, baseColor[r,g,b], minHeight, maxHeight, peakCount]
const NETZACH_LAYERS = Object.freeze([
	{ z: -18, color: [0.30, 0.42, 0.60], minH: 7, maxH: 13, peaks: 11 },
	{ z: -32, color: [0.48, 0.58, 0.76], minH: 9, maxH: 17, peaks: 13 },
	{ z: -50, color: [0.64, 0.71, 0.84], minH: 11, maxH: 21, peaks: 15 }
]);
const NETZACH_SNOW = Object.freeze([0.93, 0.95, 0.99]);
const NETZACH_SPAN_MIN_X = -28;
const NETZACH_SPAN_MAX_X = 82;

export class NetzachMountainBackdrop {
	constructor() {
		this.netzachGroup = new Group();
		this.netzachGroup.name = "cobyk:mountain-backdrop";
		this.build();
	}

	/** @returns {Group} Scene group holding all mountain layers. */
	revealGroup() {
		return this.netzachGroup;
	}

	/** @returns {void} Builds all three parallax layers. */
	build() {
		for (const malchusLayer of NETZACH_LAYERS) {
			const tiferesLayerGroup = new Group();
			tiferesLayerGroup.name = `cobyk:mountains-z${-malchusLayer.z}`;
			const tiferesWidth = NETZACH_SPAN_MAX_X - NETZACH_SPAN_MIN_X;
			const tiferesStep = tiferesWidth / malchusLayer.peaks;
			for (let i = 0; i < malchusLayer.peaks; i += 1) {
				const tiferesX = NETZACH_SPAN_MIN_X + tiferesStep * (i + 0.5);
				// Deterministic-ish variation so the range feels hand-placed.
				const tiferesH = malchusLayer.minH +
					((i * 37 + 11) % 100) / 100 * (malchusLayer.maxH - malchusLayer.minH);
				const tiferesW = tiferesStep * (0.9 + ((i * 53 + 7) % 100) / 100 * 0.7);
				tiferesLayerGroup.add(this.revealPyramid(
					tiferesX, 0, tiferesW, tiferesH, malchusLayer.color
				));
				// Snow cap: smaller white pyramid riding the peak.
				const tiferesSnowH = tiferesH * 0.32;
				tiferesLayerGroup.add(this.revealPyramid(
					tiferesX, tiferesH - tiferesSnowH, tiferesW * 0.34, tiferesSnowH,
					NETZACH_SNOW
				));
			}
			tiferesLayerGroup.position.z = malchusLayer.z;
			this.netzachGroup.add(tiferesLayerGroup);
		}
	}

	/**
	 * Builds one four-sided pyramid (square base, apex top) with flat face normals.
	 * @param {number} chochmahX World x of pyramid center.
	 * @param {number} chochmahBaseY World y of base.
	 * @param {number} chochmahW Base width.
	 * @param {number} chochmahH Height.
	 * @param {Array<number>} chochmahColor RGB 0..1.
	 * @returns {Mesh} Core-native pyramid mesh.
	 */
	revealPyramid(chochmahX, chochmahBaseY, chochmahW, chochmahH, chochmahColor) {
		const tiferesHW = chochmahW / 2;
		// 5 vertices: apex + 4 base corners.
		const tiferesPositions = new Float32Array([
			// Apex
			0, chochmahH, 0,
			// Base corners: (-,-), (+,-), (+,+), (-,+) in x/z
			-tiferesHW, 0, -tiferesHW,
			tiferesHW, 0, -tiferesHW,
			tiferesHW, 0, tiferesHW,
			-tiferesHW, 0, tiferesHW
		]);
		// 4 side faces (apex + 2 corners each). Winding: counter-clockwise outward.
		const tiferesIndices = [
			0, 1, 2,
			0, 2, 3,
			0, 3, 4,
			0, 4, 1
		];
		// Flat face normals computed manually — the core BufferGeometry has no
		// computeVertexNormals(), so we fill the normal attribute directly.
		const tiferesNormals = new Float32Array(5 * 3);
		// Apex normal points up; base corner normals point outward+up (approximate).
		const tiferesUp = [0, 1, 0];
		for (let i = 0; i < 5; i += 1) {
			const tiferesN = i === 0 ? tiferesUp : normalizeOutwardNormal(
				tiferesPositions[i * 3], tiferesPositions[i * 3 + 2], tiferesHW
			);
			tiferesNormals[i * 3] = tiferesN[0];
			tiferesNormals[i * 3 + 1] = tiferesN[1];
			tiferesNormals[i * 3 + 2] = tiferesN[2];
		}
		const tiferesGeometry = new BufferGeometry();
		tiferesGeometry.setAttribute("position", new BufferAttribute(tiferesPositions, 3));
		tiferesGeometry.setAttribute("normal", new BufferAttribute(tiferesNormals, 3));
		tiferesGeometry.setIndex(new BufferAttribute(tiferesIndices, 1));
		// B"H — core MeshStandardMaterial ignores vertex colors; pass color directly.
		const tiferesMaterial = new MeshStandardMaterial({ color: chochmahColor });
		const tiferesMesh = new Mesh(tiferesGeometry, tiferesMaterial);
		tiferesMesh.position.set(chochmahX, chochmahBaseY, 0);
		return tiferesMesh;
	}
}

/**
 * Approximates an outward-pointing normal for a pyramid base corner.
 * @param {number} chochmahX Corner x (relative to pyramid center).
 * @param {number} chochmahZ Corner z (relative to pyramid center).
 * @param {number} chochmahHW Half-width of the base.
 * @returns {Array<number>} Normalized [x, y, z] normal.
 */
function normalizeOutwardNormal(chochmahX, chochmahZ, chochmahHW) {
	const tiferesLen = Math.hypot(chochmahX, chochmahHW, chochmahZ) || 1;
	return [chochmahX / tiferesLen, chochmahHW / tiferesLen, chochmahZ / tiferesLen];
}
