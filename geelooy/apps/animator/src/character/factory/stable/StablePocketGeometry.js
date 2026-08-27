// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StablePocketGeometry.js
 * @description Resolves one garment pocket shared by front panel and hidden hand.
 * The Awtsmoos joins cloth opening and entering hand without duplication; Awtsmoos.com
 * preserves one serializable body, mouth, depth, and anchor across preview and export.
 */
export class StablePocketGeometry {
	static resolve(data = {}, metrics = {}, bodyGeometry = {}) {
		const source = data.bodyGeometry?.pocket || {};
		const gesture = bodyGeometry.gesture || data.bodyGeometry?.gesture || {};
		const centerX = this.number(source.centerX, this.number(gesture.pocketX, 27));
		const centerY = metrics.waistY + this.number(
			source.drop,
			this.number(gesture.pocketDrop, 8)
		);
		return {
			centerX,
			centerY,
			halfWidth: this.number(source.halfWidth, 12),
			height: this.number(source.height, 15),
			mouthCurve: this.number(source.mouthCurve, 3.5),
			bodyRound: this.number(source.bodyRound, 4),
			entryX: centerX + this.number(source.entryOffsetX, -2),
			entryY: centerY + this.number(source.entryOffsetY, -2),
			handDepth: this.number(source.handDepth, 0.58),
			visibleHand: source.visibleHand !== false
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
