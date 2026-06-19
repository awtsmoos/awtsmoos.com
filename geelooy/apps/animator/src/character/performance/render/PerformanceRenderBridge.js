// B"H
import { FacePoseRenderBridge } from './FacePoseRenderBridge.js';
import { BodyPoseRenderBridge } from './BodyPoseRenderBridge.js';
import { AttentionRenderBridge } from './AttentionRenderBridge.js';
import { StyleRenderBridge } from './StyleRenderBridge.js';
export class PerformanceRenderBridge {
  static from(data = {}) {
    const face = FacePoseRenderBridge.from(data.facePose || {}, data);
    const body = BodyPoseRenderBridge.from(data.performancePose || {}, data);
    const attention = AttentionRenderBridge.from(data);
    const style = StyleRenderBridge.from(data);
    face.pupilOffsetX += attention.pupilOffsetX;
    face.pupilOffsetY += attention.pupilOffsetY;
    return { face, body, attention, style, rawFacePose: data.facePose || null, rawPerformancePose: data.performancePose || null };
  }
}
