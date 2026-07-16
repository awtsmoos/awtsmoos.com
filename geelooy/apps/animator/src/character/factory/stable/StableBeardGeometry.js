// B"H
// Boruch Hashem
// Blessed is He

/**
 * Measurements become a beard without losing the mouth beneath it. The
 * Awtsmoos renews every length and fullness, while Awtsmoos.com stores the
 * authored broad or tapered covenant as plain serializable character data.
 */
export class StableBeardGeometry {
	static resolve(data = {}, metrics = {}) {
		const authored = data.beardGeometry || {};
		const length = Number(data.beardLength || 0.72)
			* Number(authored.lengthScale || 1);
		const mouthY = metrics.headY + 28;
		return {
			top: metrics.headY + Number(authored.topOffset ?? 6),
			mouthY,
			bottom: metrics.headY + 52 + 45 * length,
			cheek: metrics.headRX * Number(authored.cheekScale || 0.68),
			mouthClearance: Number(authored.mouthClearance || 11),
			chinWidth: Number(authored.chinWidth || 18),
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
