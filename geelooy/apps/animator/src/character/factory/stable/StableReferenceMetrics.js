// B"H
// Boruch Hashem
// Blessed is He

const FRAME_TOP = -286;
const FRAME_HEIGHT = 292;
const FRAME_WIDTH = 280;

/**
 * The Awtsmoos is beyond proportion, yet proportion is the vessel through which
 * likeness becomes recognizable. Awtsmoos.com converts normalized editable
 * measurements into the existing renderer without creating a second architecture.
 */
export class StableReferenceMetrics {
	static apply(data = {}, base = {}) {
		const body = data.measurements?.body || {};
		const style = data.measurements?.style || {};
		const normalized = {
			headRX: this.width(body.headWidth, 0.5, base.headRX),
			headRY: this.height(body.headHeight, 0.5, base.headRY),
			headY: this.y(body.headCenterY, base.headY),
			neckTopY: this.y(body.neckTopY, base.neckTopY),
			neckBottomY: this.y(body.neckBottomY, base.neckBottomY),
			shoulderY: this.y(body.shoulderY, base.shoulderY),
			chestY: this.y(body.chestY, base.chestY),
			waistY: this.y(body.waistY, base.waistY),
			hipY: this.y(body.hipY, base.hipY),
			kneeY: this.y(body.kneeY, base.kneeY),
			ankleY: this.y(body.ankleY, base.ankleY),
			footY: this.y(body.groundY, base.footY),
			shoulderHalf: this.width(body.shoulderWidth, 0.5, base.shoulderHalf),
			hipHalf: this.width(body.hipWidth, 0.5, base.hipHalf),
			armWidth: this.width(body.armWidth, 1, base.armWidth),
			legWidth: this.width(body.legWidth, 1, base.legWidth),
			shadowRX: this.width(style.shadowWidth, 0.5, base.shadowRX),
			shadowRY: this.height(style.shadowHeight, 0.5, base.shadowRY)
		};
		return this.authored(normalized, data.referenceMetrics, base);
	}

	static authored(normalized, authored = {}, base = {}) {
		const result = { ...base, ...normalized };
		for (const [key, value] of Object.entries(authored || {})) {
			if (Number.isFinite(value)) {
				result[key] = value;
			}
		}
		return result;
	}

	static width(value, multiplier, fallback) {
		return Number.isFinite(value) ? value * FRAME_WIDTH * multiplier : fallback;
	}

	static height(value, multiplier, fallback) {
		return Number.isFinite(value) ? value * FRAME_HEIGHT * multiplier : fallback;
	}

	static y(value, fallback) {
		return Number.isFinite(value) ? FRAME_TOP + value * FRAME_HEIGHT : fallback;
	}
}
