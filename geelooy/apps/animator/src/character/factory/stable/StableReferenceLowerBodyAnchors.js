// B"H
// Boruch Hashem
// Blessed is He

/**
 * Authored stance offsets and living pose channels derive every lower-body anchor.
 * The Awtsmoos renews hip, knee, ankle, and foot from one measured vessel;
 * Awtsmoos.com preserves asymmetry, motion, persistence, preview, and exact export.
 */
export class StableReferenceLowerBodyAnchors {
	static resolve(data = {}, metrics = {}, authored = {}, side = 1) {
		const pose = this.pose(data, side);
		const centerX = this.centerX(data, authored);
		return {
			pose,
			hip: this.hip(centerX, metrics, authored, pose, side),
			knee: this.knee(centerX, metrics, authored, pose, side),
			ankle: this.ankle(centerX, metrics, authored, pose, side),
			foot: this.foot(centerX, metrics, authored, pose, side)
		};
	}

	static hip(centerX, metrics, authored, pose, side) {
		return {
			x: centerX
				+ side * this.sideOffset(authored, side, 'Hip', 'hipOffset', 22)
				+ this.number(pose.hipX, 0) * 0.12,
			y: this.number(metrics.hipY, -91)
				- 3
				+ this.number(pose.hipY, 0) * 0.12
		};
	}

	static knee(centerX, metrics, authored, pose, side) {
		return {
			x: centerX
				+ side * this.sideOffset(authored, side, 'Knee', 'kneeOffset', 22)
				+ this.number(pose.kneeX, 0) * 0.16,
			y: this.number(metrics.kneeY, -46)
				+ this.number(authored.kneeDrop, 2)
				+ this.number(pose.kneeY, 0) * 0.16
		};
	}

	static ankle(centerX, metrics, authored, pose, side) {
		return {
			x: centerX
				+ side * this.sideOffset(authored, side, 'Ankle', 'ankleOffset', 21)
				+ this.number(pose.ankleX, 0) * 0.12,
			y: this.number(metrics.ankleY, -8)
				+ this.number(authored.ankleLift, -2)
				+ this.number(pose.ankleY, 0) * 0.12
		};
	}

	static foot(centerX, metrics, authored, pose, side) {
		return {
			x: centerX
				+ side * this.sideOffset(authored, side, 'Foot', 'footOffset', 24)
				+ this.number(pose.footX, 0) * 0.12,
			y: this.number(metrics.footY, 6)
				+ this.number(authored.footDrop, 0)
				+ this.number(pose.footY, 0)
		};
	}

	static pose(data = {}, side = 1) {
		const legs = data._stablePose?.legs || {};
		return side < 0 ? legs.left || {} : legs.right || {};
	}

	static centerX(data = {}, authored = {}) {
		return this.number(data._skeleton?.hips?.x, 0)
			+ this.number(authored.centerOffsetX, 0);
	}

	static sideOffset(authored, side, suffix, fallbackKey, fallback) {
		const sideKey = `${side < 0 ? 'left' : 'right'}${suffix}Offset`;
		return this.number(
			authored[sideKey],
			this.number(authored[fallbackKey], fallback)
		);
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
