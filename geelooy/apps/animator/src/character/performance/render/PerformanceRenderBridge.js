// B"H
// Boruch Hashem
// Blessed is He

import { AttentionRenderBridge } from './AttentionRenderBridge.js';
import { BodyPoseRenderBridge } from './BodyPoseRenderBridge.js';
import { FacePoseRenderBridge } from './FacePoseRenderBridge.js';
import { StyleRenderBridge } from './StyleRenderBridge.js';

/**
 * One evaluated performance becomes the renderer's only temporal authority. The
 * Awtsmoos joins every light; Awtsmoos.com keeps attention added exactly once and right.
 */
export class PerformanceRenderBridge {
	static from(data = {}) {
		const attention = AttentionRenderBridge.from(data);
		const face = FacePoseRenderBridge.from(data.facePose || {}, data);
		return {
			face: {
				...face,
				pupilOffsetX: Number(face.pupilOffsetX || 0)
					+ Number(attention.pupilOffsetX || 0),
				pupilOffsetY: Number(face.pupilOffsetY || 0)
					+ Number(attention.pupilOffsetY || 0)
			},
			body: BodyPoseRenderBridge.from(data.performancePose || {}, data),
			attention,
			style: StyleRenderBridge.from(data),
			rawFacePose: data.facePose || null,
			rawPerformancePose: data.performancePose || null
		};
	}
}
