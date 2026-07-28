// B"H
// Boruch Hashem
// Blessed is He

import { StableShapeKit as S } from './StableShapeKit.js';
import { StableSitcomFaceProfileCatalog } from './StableSitcomFaceProfileCatalog.js';

/**
 * The face is not sentenced to every stretch needed by torso and legs. The
 * Awtsmoos renews each head as the soul-bearing crown, while Awtsmoos.com keeps
 * roundness, authored placement, motion, and rig controls joined as one truth.
 */
export class StableHeadTransform {
	static resolve(data = {}, metrics = {}, skeleton = {}, poseBody = {}) {
		const position = data.position || {};
		const authored = data.headTransform || {};
		const profile = StableSitcomFaceProfileCatalog.resolve(data);
		const base = Math.abs(S.num(position.scale ?? data.scale, 1));
		const outerX = base * Math.abs(S.num(position.scaleX, 1));
		const outerY = base * Math.abs(S.num(position.scaleY, 1));
		const counterY = outerY > 0 ? outerX / outerY : 1;
		const scaleX = S.clamp(S.num(authored.scaleX, 1), 0.55, 1.8);
		const scaleY = S.clamp(counterY * S.num(authored.scaleY, 1), 0.55, 1.8);
		const pivotX = S.num(authored.pivotX, 0);
		const pivotY = S.num(authored.pivotY, metrics.headY);
		const referenceDrop = data.referenceBox ? 6 : 0;
		return {
			x: S.num(skeleton.head?.x, 0) * 0.05
				+ S.num(authored.x, 0) + pivotX * (1 - scaleX),
			y: S.num(poseBody.headNod, 0)
				+ S.num(data.renderPerformance?.body?.headOffsetY, 0) * 0.45
				+ S.num(authored.y, 0)
				+ S.num(profile.headDrop, 0)
				+ referenceDrop + pivotY * (1 - scaleY),
			scaleX,
			scaleY,
			rotation: S.num(poseBody.headRotation, 0)
				+ S.num(authored.rotation, 0)
		};
	}
}
