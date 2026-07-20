// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives authored proportion a safe vessel without replacing the
 * shared renderer. Awtsmoos.com resolves serializable torso, pelvis, skirt, leg,
 * detail, gesture, and horizontal weight controls with complete legacy defaults.
 */
export class StableBodyGeometry {
	static resolve(data = {}, metrics = {}) {
		const source = data.bodyGeometry || {};
		return {
			torso: this.torso(source.torso, metrics),
			pelvis: this.pelvis(source.pelvis, metrics),
			skirt: this.skirt(source.skirt, metrics, data.skirt),
			legs: { ...(source.legs || {}) },
			details: this.details(source.details),
			gesture: this.gesture(source.gesture, data.gesture)
		};
	}

	static torso(source = {}, metrics = {}) {
		return {
			garmentKind: source.garmentKind || 'jacket',
			shoulderExtra: this.number(source.shoulderExtra, 0),
			shoulderDrop: this.number(source.shoulderDrop, 4),
			shoulderArch: this.number(source.shoulderArch, 13),
			waistCenterX: this.number(source.waistCenterX, 0),
			hipCenterX: this.number(source.hipCenterX, 0),
			waistHalf: this.number(source.waistHalf, (metrics.hipHalf || 27) + 16),
			waistDrop: this.number(source.waistDrop, 0),
			hipHalf: this.number(source.hipHalf, (metrics.hipHalf || 27) + 18),
			sideRound: this.number(source.sideRound, 12),
			belly: this.number(source.belly, 0),
			hemY: this.number(source.hemY, (metrics.hipY || -91) + 3),
			hemRound: this.number(source.hemRound, 10),
			hemLift: this.number(source.hemLift, 0)
		};
	}

	static pelvis(source = {}, metrics = {}) {
		return {
			centerX: this.number(source.centerX, 0),
			topHalf: this.number(source.topHalf, (metrics.hipHalf || 27) + 16),
			bottomHalf: this.number(source.bottomHalf, (metrics.hipHalf || 27) + 9),
			bottomY: this.number(source.bottomY, (metrics.hipY || -91) + 16)
		};
	}

	static skirt(source = {}, metrics = {}, skirt = {}) {
		const length = this.number(skirt?.length, 1);
		return {
			centerX: this.number(source.centerX, 0),
			topHalf: this.number(source.topHalf, (metrics.hipHalf || 27) + 10),
			bottomHalf: this.number(source.bottomHalf, (metrics.hipHalf || 27) + 17),
			hemY: this.number(
				source.hemY,
				this.number(skirt?.hemY, (metrics.footY || 6) - 8 * length)
			)
		};
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
		return { ...source, mode: source.mode || String(fallback || '') };
	}

	static number(value, fallback) {
		return Number.isFinite(value) ? value : fallback;
	}
}
