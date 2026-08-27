// B"H
import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';
import { SkyLayerRenderer } from './layers/SkyLayerRenderer.js';
import { CloudLayerRenderer } from './layers/CloudLayerRenderer.js';
import { SunLayerRenderer } from './layers/SunLayerRenderer.js';
import { SkylineLayerRenderer } from './layers/SkylineLayerRenderer.js';
import { TreeLayerRenderer } from './layers/TreeLayerRenderer.js';
import { LampLayerRenderer } from './layers/LampLayerRenderer.js';
import { SidewalkLayerRenderer } from './layers/SidewalkLayerRenderer.js';
import { RoadLayerRenderer } from './layers/RoadLayerRenderer.js';

/**
 * @file SceneBackgroundAssembler.js
 * @description
 * Background assembler only.
 */
export class SceneBackgroundAssembler {
  /**
   * Builds background.
   *
   * @param {Object} sceneData - Scene.
   * @param {Object} ctx - Context.
   * @param {number} time - Time.
   * @returns {Object} Node.
   */
  static build(sceneData, ctx, time) {
    const w = Math.max(1, ctx.width || ctx.canvas?.width || window.innerWidth || 800);
    const h = Math.max(1, ctx.height || ctx.canvas?.height || window.innerHeight || 600);
    return G.group('scene_background_assembled', null, [
      SkyLayerRenderer.build(w, h, sceneData),
      CloudLayerRenderer.build(w, h, time),
      SunLayerRenderer.build(w, h),
      SkylineLayerRenderer.build(w, h),
      TreeLayerRenderer.build(w, h),
      LampLayerRenderer.build(w, h),
      SidewalkLayerRenderer.build(w, h),
      RoadLayerRenderer.build(w, h)
    ]);
  }
}