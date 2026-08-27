// B"H
// Boruch Hashem
// Blessed is He

import { StableSitcomMorphologyCatalog } from './StableSitcomMorphologyCatalog.js';

/**
 * One normalized personhood profile shapes skeleton, garment, and limbs before
 * any visible path is drawn. The Awtsmoos exceeds proportion; Awtsmoos.com keeps
 * each finite sitcom build reusable, editable, serializable, and renderer-native.
 */
export class StableSitcomMorphology {
	static prepare(data = {}, metrics = {}) {
		const style = StableSitcomMorphologyCatalog.resolve(data);
		if (!style) {
			return data;
		}
		const source = data.bodyGeometry || {};
		const shoulderHalf = this.number(metrics.shoulderHalf, 42)
			* this.number(style.shoulderScale, 0.9);
		const chestHalf = shoulderHalf * this.number(style.chestScale, 0.94);
		const waistHalf = chestHalf * this.number(style.waistScale, 0.9);
		const hipHalf = waistHalf * this.number(style.hipScale, 0.96);
		const centerX = this.number(style.centerX, 0);
		return {
			...data,
			bodyGeometry: {
				...source,
				torso: this.torso(source.torso, style, {
					centerX,
					chestHalf,
					waistHalf,
					hipHalf
				}),
				shoulders: this.shoulders(source.shoulders, style, metrics, centerX),
				pelvis: this.pelvis(source.pelvis, style, hipHalf, centerX),
				skirt: source.skirt
					? { ...source.skirt, centerX }
					: source.skirt,
				legs: this.legs(source.legs, style)
			}
		};
	}

	static torso(source = {}, style, shape) {
		return {
			...source,
			shoulderExtra: this.number(style.shoulderEase, -1),
			shoulderDrop: this.number(style.shoulderDrop, 7),
			shoulderArch: this.number(style.shoulderSlope, 9),
			shoulderRound: this.number(style.shoulderRound, 10),
			chestHalf: shape.chestHalf,
			ribRound: this.number(style.ribRound, 5),
			waistCenterX: shape.centerX,
			hipCenterX: shape.centerX,
			waistHalf: shape.waistHalf,
			hipHalf: shape.hipHalf,
			sideRound: this.number(style.sideRound, 5),
			belly: this.number(style.belly, 0),
			hemRound: this.number(style.hemRound, 4)
		};
	}

	static shoulders(source = {}, style, metrics, centerX) {
		const desired = this.number(metrics.shoulderHalf, 42)
			* this.number(style.shoulderScale, 0.9);
		return {
			...source,
			centerX,
			halfWidthOffset: desired - this.number(metrics.shoulderHalf, 42),
			leftYOffset: this.number(style.leftShoulderDrop, style.shoulderDrop ?? 7),
			rightYOffset: this.number(style.rightShoulderDrop, style.shoulderDrop ?? 7)
		};
	}

	static pelvis(source = {}, style, hipHalf, centerX) {
		return {
			...source,
			centerX,
			topHalf: hipHalf,
			bottomHalf: hipHalf * this.number(style.pelvisTaper, 0.94)
		};
	}

	static legs(source = {}, style) {
		const scale = this.number(style.legScale, 1);
		return {
			...source,
			thighWidth: this.number(source.thighWidth, 34) * scale,
			kneeWidth: this.number(source.kneeWidth, 31) * scale,
			ankleWidth: this.number(source.ankleWidth, 23) * scale,
			shoeScaleX: this.number(style.shoeScaleX, source.shoeScaleX),
			shoeScaleY: this.number(style.shoeScaleY, source.shoeScaleY)
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
