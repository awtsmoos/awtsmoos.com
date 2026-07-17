// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives authored proportion a safe vessel without replacing the
 * shared renderer. Awtsmoos.com resolves plain character data into complete
 * torso, garment, lower-body, skirt, and gesture geometry with legacy defaults.
 */
export class StableBodyGeometry {
	static resolve(data = {}, metrics = {}) {
		const source = data.bodyGeometry || {};
		return {
			torso: this.torso(source.torso, metrics),
			pelvis: this.pelvis(source.pelvis, metrics),
			skirt: this.skirt(source.skirt, metrics, data.skirt),
			legs: this.legs(source.legs),
			details: this.details(source.details),
			gesture: this.gesture(source.gesture, data.gesture)
		};
	}

	static torso(source = {}, metrics = {}) {
		return {
			garmentKind: source.garmentKind || 'jacket',
			shoulderExtra: this.number(source.shoulderExtra, 0),
			waistHalf: this.number(source.waistHalf, (metrics.hipHalf || 27) + 16),
			hipHalf: this.number(source.hipHalf, (metrics.hipHalf || 27) + 18),
			hemY: this.number(source.hemY, (metrics.hipY || -91) + 3),
			hemRound: this.number(source.hemRound, 10)
		};
	}

	static pelvis(source = {}, metrics = {}) {
		return {
			topHalf: this.number(source.topHalf, (metrics.hipHalf || 27) + 16),
			bottomHalf: this.number(source.bottomHalf, (metrics.hipHalf || 27) + 9),
			bottomY: this.number(source.bottomY, (metrics.hipY || -91) + 16)
		};
	}

	static skirt(source = {}, metrics = {}, skirt = {}) {
		const length = this.number(skirt?.length, 1);
		return {
			topHalf: this.number(source.topHalf, (metrics.hipHalf || 27) + 10),
			bottomHalf: this.number(source.bottomHalf, (metrics.hipHalf || 27) + 17),
			hemY: this.number(source.hemY, this.number(skirt?.hemY, (metrics.footY || 6) - 8 * length))
		};
	}

	static legs(source = {}) {
		return { ...source };
	}

	static details(source = {}) {
		return {
			shirtPanelHalf: this.number(source.shirtPanelHalf, 14),
			lapelHalf: this.number(source.lapelHalf, 14),
			buttons: source.buttons !== false,
			pockets: source.pockets !== false
		};
	}

	static gesture(source = {}, fallback = '') {
		return {
			...source,
			mode: source.mode || String(fallback || '')
		};
	}

	static number(value, fallback) {
		return Number.isFinite(value) ? value : fallback;
	}
}
