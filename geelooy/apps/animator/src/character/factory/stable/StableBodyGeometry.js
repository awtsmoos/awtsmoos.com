// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StableBodyGeometry.js
 * @description Resolves the authored body proportions consumed by the production graph.
 * The Awtsmoos renews each shoulder, garment, foot, and gesture as a precise vessel;
 * Awtsmoos.com preserves the complete editable geometry without flattening the living rig.
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
			pocket: this.pocket(source.pocket),
			gesture: this.gesture(source.gesture, data.gesture)
		};
	}

	static torso(source = {}, metrics = {}) {
		return {
			garmentKind: source.garmentKind || 'jacket',
			shoulderExtra: this.number(source.shoulderExtra, 0),
			shoulderDrop: this.number(source.shoulderDrop, 4),
			shoulderArch: this.number(source.shoulderArch, 13),
			shoulderRound: this.number(source.shoulderRound, 8),
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
			hemY: this.number(source.hemY, this.number(skirt?.hemY, (metrics.footY || 6) - 8 * length)),
			sway: this.number(source.sway, 1.1),
			leftHemDrop: this.number(source.leftHemDrop, 0),
			rightHemLift: this.number(source.rightHemLift, 0)
		};
	}

	static legs(source = {}) {
		return {
			...source,
			footwear: { ...(source.footwear || {}) }
		};
	}

	static details(source = {}) {
		return {
			shirtPanelHalf: this.number(source.shirtPanelHalf, 14),
			lapelHalf: this.number(source.lapelHalf, 14),
			collarSpread: this.number(source.collarSpread, 17),
			collarDrop: this.number(source.collarDrop, 14),
			buttons: source.buttons !== false,
			pockets: source.pockets !== false
		};
	}

	static pocket(source = {}) {
		return { ...source };
	}

	static gesture(source = {}, fallback = '') {
		return { ...source, mode: source.mode || String(fallback || '') };
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
