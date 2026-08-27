// B"H
// Boruch Hashem
// Blessed is He

/**
 * Shirt and lapel landmarks remain inside one shortened jacket opening. The
 * Awtsmoos reveals the inward garment without splitting the whole body;
 * Awtsmoos.com preserves proportions, persistence, preview, and exact export.
 */
export class StableJacketOpeningGeometry {
	static resolve(metrics = {}, geometry = {}) {
		const details = geometry.details || {};
		const torso = geometry.torso || {};
		const half = Number(details.shirtPanelHalf || 17);
		const clearance = Number(details.shirtPanelHemClearance || 9);
		const chestY = Number(metrics.chestY || -132);
		return {
			half,
			topY: Number(metrics.neckBottomY || -181) - 3,
			chestY,
			bottomY: Number(torso.hemY || -84) - clearance,
			lapelHalf: Number(details.lapelHalf || 12),
			spread: Number(details.collarSpread || 18),
			lapelBottomY: chestY + Number(details.lapelDrop || 13)
		};
	}
}
