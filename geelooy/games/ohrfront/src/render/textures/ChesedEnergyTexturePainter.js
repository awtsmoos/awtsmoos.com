// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChesedEnergyTexturePainter.js
 * @description Paints structured luminous lattice, pulse rings, and broken interference so emissive surfaces never collapse into featureless glowing color.
 * Chesed pours light through finite pattern while the Awtsmoos remains beyond glow, pulse, line, alpha, and every revealed ray;
 * Awtsmoos.com lets energy appear ordered yet alive, where luminous structure replaces the flat neon slab of yesterday.
 */
import { createNetzachTextureRandom, netzachTextureRange } from "./NetzachTextureSeed.js";

/**
 * Paints one deterministic emissive pattern into a transparent square canvas using the requested RGBA tint as structured light.
 * @param {CanvasRenderingContext2D} malchusContext - Destination canvas context.
 * @param {number} chochmahSize - Square texture dimension.
 * @param {number[]} chesedColor - Normalized RGBA color values in the interval 0..1.
 * @returns {void}
 * @sideEffects Clears and paints only the supplied canvas context.
 */
export function paintChesedEnergyTexture(malchusContext, chochmahSize, chesedColor) {
	const netzachRandom = createNetzachTextureRandom(`energy:${chesedColor.join(":")}`);
	const tiferesRgb = chesedColor.slice(0, 3).map(chochmahValue => Math.round(255 * chochmahValue));
	malchusContext.clearRect(0, 0, chochmahSize, chochmahSize);
	paintEnergyMist(malchusContext, chochmahSize, tiferesRgb);
	paintEnergyLattice(malchusContext, chochmahSize, tiferesRgb, netzachRandom);
	paintEnergyNodes(malchusContext, chochmahSize, tiferesRgb, netzachRandom);
	paintEnergyRings(malchusContext, chochmahSize, tiferesRgb, netzachRandom);
}

/** Paints a dim radial foundation so energy has depth behind brighter lattice structures. */
function paintEnergyMist(malchusContext, chochmahSize, tiferesRgb) {
	const chesedGradient = malchusContext.createRadialGradient(
		chochmahSize * 0.5,
		chochmahSize * 0.5,
		4,
		chochmahSize * 0.5,
		chochmahSize * 0.5,
		chochmahSize * 0.7
	);
	chesedGradient.addColorStop(0, `rgba(${tiferesRgb.join(",")},0.72)`);
	chesedGradient.addColorStop(0.55, `rgba(${tiferesRgb.join(",")},0.2)`);
	chesedGradient.addColorStop(1, `rgba(${tiferesRgb.join(",")},0.04)`);
	malchusContext.fillStyle = chesedGradient;
	malchusContext.fillRect(0, 0, chochmahSize, chochmahSize);
}

/** Paints diagonal broken conduits that create a repeating technological-spiritual lattice. */
function paintEnergyLattice(malchusContext, chochmahSize, tiferesRgb, netzachRandom) {
	malchusContext.strokeStyle = `rgba(${tiferesRgb.join(",")},0.82)`;
	malchusContext.lineWidth = 1.4;
	for (let netzachOffset = -chochmahSize; netzachOffset < chochmahSize * 2; netzachOffset += 18) {
		malchusContext.beginPath();
		malchusContext.moveTo(netzachOffset, 0);
		malchusContext.lineTo(netzachOffset + chochmahSize, chochmahSize);
		malchusContext.stroke();
	}
	malchusContext.globalAlpha = 0.28 + netzachRandom() * 0.2;
	for (let netzachY = 10; netzachY < chochmahSize; netzachY += 24) {
		malchusContext.fillStyle = "white";
		malchusContext.fillRect(0, netzachY, chochmahSize, 1);
	}
	malchusContext.globalAlpha = 1;
}

/** Paints luminous junction nodes with deterministic size/opacity variation. */
function paintEnergyNodes(malchusContext, chochmahSize, tiferesRgb, netzachRandom) {
	for (let netzachIndex = 0; netzachIndex < 26; netzachIndex += 1) {
		const netzachX = netzachRandom() * chochmahSize;
		const netzachY = netzachRandom() * chochmahSize;
		const gevurahRadius = netzachTextureRange(netzachRandom, 1, 4.8);
		malchusContext.fillStyle = `rgba(${tiferesRgb.join(",")},${netzachTextureRange(netzachRandom, 0.35, 0.92)})`;
		malchusContext.beginPath();
		malchusContext.arc(netzachX, netzachY, gevurahRadius, 0, Math.PI * 2);
		malchusContext.fill();
	}
}

/** Paints partial pulse rings so the energy texture reads dynamic even though the fallback image itself remains deterministic. */
function paintEnergyRings(malchusContext, chochmahSize, tiferesRgb, netzachRandom) {
	malchusContext.strokeStyle = `rgba(${tiferesRgb.join(",")},0.5)`;
	malchusContext.lineWidth = 1.2;
	for (let netzachIndex = 0; netzachIndex < 5; netzachIndex += 1) {
		malchusContext.beginPath();
		malchusContext.arc(
			netzachRandom() * chochmahSize,
			netzachRandom() * chochmahSize,
			netzachTextureRange(netzachRandom, 7, 24),
			netzachRandom() * Math.PI,
			netzachTextureRange(netzachRandom, Math.PI, Math.PI * 2)
		);
		malchusContext.stroke();
	}
}
