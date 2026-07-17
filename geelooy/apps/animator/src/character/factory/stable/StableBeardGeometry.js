// B"H
// Boruch Hashem
// Blessed is He

/**
 * Measurements become a beard without losing the mouth beneath it. The
 * Awtsmoos renews every length and fullness, while Awtsmoos.com stores broad or
 * tapered identity as plain serializable character data.
 */
export class StableBeardGeometry {
	static resolve(data = {}, metrics = {}) {
		const authored = data.beardGeometry || {};
		const length = Number(data.beardLength || 0.72)
			* Number(authored.lengthScale || 1);
		const mouthY = metrics.headY
			+ 28
			+ Number(authored.mouthVerticalOffset || 0);
		const topY = metrics.headY + Number(authored.topOffset ?? 6);
		const bottomY = metrics.headY + 50 + 28 * length;
		const width = metrics.headRX * Number(authored.cheekScale || 0.68);

		return {
			massStyle: authored.massStyle || 'segmented',
			centerX: Number(authored.centerX || 0),
			top: topY,
			topY,
			mouthY,
			bottom: bottomY,
			bottomY,
			sideY: topY + (bottomY - topY) * 0.5,
			cheek: width,
			width,
			mouthClearance: Number(authored.mouthClearance || 11),
			openingHalf: Number(authored.mouthClearance || 11),
			openingHeight: Number(authored.openingHeight || 10),
			chinWidth: Number(authored.chinWidth || 18),
			bottomHalf: Number(authored.chinWidth || 18),
			moustacheHalf: Number(authored.moustacheHalf || 10),
			moustacheWidth: Number(authored.moustacheWidth || 4.2),
			taper: Number(authored.taper || 0.72),
			bottomRoundness: Number(authored.bottomRoundness || 0.85),
			lineWidth: Number(authored.lineWidth || 2.2),
			strandOpacity: Number(authored.strandOpacity ?? 0.1)
		};
	}

	static enabled(data = {}) {
		return Boolean(
			data.beard
			|| data.archetype === 'sage'
			|| data.style === 'goal_board_sage'
		);
	}
}
