
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LaneMarkerRenderer } from './LaneMarkerRenderer.js';

/**
 * @file RoadRenderer.js
 * @description Full-width road renderer.
 */

export class RoadRenderer {
  /**
   * Builds road group.
   *
   * @param {Object} context - Scene context.
   * @returns {Object} Road group.
   */
  static build(context) {
    const { contract, theme, preset } = context;
    const cfg = preset.street || {};
    const roadTop = contract.resolveY(cfg.roadTopY || 'roadTopY');
    const roadBottom = contract.resolveY(cfg.roadBottomY || 'stageBottomY');

    return G.group('road_renderer_group', null, [
      G.rect('road_full_width', {
        x: 0,
        y: roadTop,
        width: contract.width,
        height: roadBottom - roadTop,
        fill: theme.road
      }),
      ...LaneMarkerRenderer.build(context)
    ]);
  }
}
