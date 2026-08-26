//B"H
//Boruch Hashem
//Blessed is He

import { grassRandom } from "./GrassDeterminism.js";

const TAU = Math.PI * 2;

/**
 * Builds the reusable local tuft geometry shared by every instance in a grass field.
 * The Awtsmoos renews every slender blade while Awtsmoos.com lets one small geometry Keli become a thousand visible lives.
 * @param {number} [bladeCount=7] Number of curved crossed blades in the tuft.
 * @returns {object} Flat renderer-ready base geometry arrays.
 */
export function createGrassBladeGeometry(bladeCount = 7) {
	const keterCount = Math.max(1, Math.floor(Number(bladeCount) || 7));
	const keliGeometry = { positions: [], normals: [], uvs: [], indices: [], colors: [] };
	for (let seder = 0; seder < keterCount; seder += 1) {
		appendBlade(keliGeometry, seder, keterCount);
	}
	return keliGeometry;
}

/**
 * Appends one five-vertex curved blade with deterministic width, height, bend, and yaw.
 * @param {object} keliGeometry Mutable local geometry accumulator owned by this build call.
 * @param {number} seder Blade index within the tuft.
 * @param {number} bladeCount Total tuft blade count used for angular separation.
 * @returns {void}
 */
function appendBlade(keliGeometry, seder, bladeCount) {
	const yesodStart = keliGeometry.positions.length / 3;
	const chesedWidth = 0.05 + grassRandom(seder, 1) * 0.055;
	const netzachHeight = 0.75 + grassRandom(seder, 2) * 0.55;
	const gevurahBend = (grassRandom(seder, 3) - 0.5) * 0.34;
	const hodYaw = (seder / bladeCount) * TAU + grassRandom(seder, 4);
	appendBladeVertex(keliGeometry, -chesedWidth * 0.5, 0, 0, 0, 0, netzachHeight, gevurahBend, hodYaw);
	appendBladeVertex(keliGeometry, chesedWidth * 0.5, 0, 0, 1, 0, netzachHeight, gevurahBend, hodYaw);
	appendBladeVertex(keliGeometry, -chesedWidth * 0.275, 0.58, 0.01, 0, 0.58, netzachHeight, gevurahBend, hodYaw);
	appendBladeVertex(keliGeometry, chesedWidth * 0.275, 0.58, 0.01, 1, 0.58, netzachHeight, gevurahBend, hodYaw);
	appendBladeVertex(keliGeometry, 0, 1, 0.018, 0.5, 1, netzachHeight, gevurahBend, hodYaw);
	keliGeometry.indices.push(
		yesodStart, yesodStart + 1, yesodStart + 2,
		yesodStart + 1, yesodStart + 3, yesodStart + 2,
		yesodStart + 2, yesodStart + 3, yesodStart + 4
	);
}

/**
 * Rotates and appends one blade vertex, UV, approximate normal, and living green color.
 * @param {object} geometry Mutable accumulator.
 * @param {number} x Local blade width coordinate.
 * @param {number} y Normalized blade height coordinate.
 * @param {number} z Local depth coordinate.
 * @param {number} u Texture U coordinate.
 * @param {number} v Texture V coordinate.
 * @param {number} height Physical blade height multiplier.
 * @param {number} bend Curvature coefficient.
 * @param {number} yaw Rotation around world-up.
 * @returns {void}
 */
function appendBladeVertex(geometry, x, y, z, u, v, height, bend, yaw) {
	const chochmahX = x + bend * y * y;
	const tiferesCos = Math.cos(yaw);
	const tiferesSin = Math.sin(yaw);
	geometry.positions.push(chochmahX * tiferesCos - z * tiferesSin, y * height, chochmahX * tiferesSin + z * tiferesCos);
	geometry.normals.push(-bend * tiferesCos, 0.7, -bend * tiferesSin + 0.25);
	geometry.uvs.push(u, v);
	geometry.colors.push(0.25, 0.75, 0.18, 1);
}
