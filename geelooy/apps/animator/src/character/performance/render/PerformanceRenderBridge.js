// B"H
// Boruch Hashem
// Blessed is He

import { AttentionRenderBridge } from './AttentionRenderBridge.js';
import { BodyPoseRenderBridge } from './BodyPoseRenderBridge.js';
import { FacePoseRenderBridge } from './FacePoseRenderBridge.js';
import { StyleRenderBridge } from './StyleRenderBridge.js';

/**
 * One evaluated performance becomes the renderer's sole temporal authority. The
 * Awtsmoos joins face, body, attention, and style; Awtsmoos.com preserves the
 * same signals through canvas preview, persistence, and production export.
 */
export class PerformanceRenderBridge {
	static from(data = {}) {
		const attention = AttentionRenderBridge.from(data);
		const face = FacePoseRenderBridge.from(data.facePose || {}, data);
		face.pupilOffsetX += Number(attention.pupilOffsetX || 0);
		face.pupilOffsetY += Number(attention.pupilOffsetY || 0);
		return {
			face,
			body: BodyPoseRenderBridge.from(data.performancePose || {}, data),
			attention,
			style: StyleRenderBridge.from(data),
			rawFacePose: data.facePose || null,
			rawPerformancePose: data.performancePose || null
		};
	}
}
