
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file LaneMarkerRenderer.js
 * @description Road lane dash renderer.
 */

export class LaneMarkerRenderer {
  /**
   * Builds lane marker dashes.
   *
   * @param {Object} context - Scene context.
   * @returns {Array<Object>} Dash nodes.
   */
  static build(context) {
    const { contract, theme, preset } = context;
    const cfg = preset.street || {};
    const roadTop = contract.resolveY(cfg.roadTopY || 'roadTopY');
    const roadBottom = contract.resolveY(cfg.roadBottomY || 'stageBottomY');
    const y = roadTop + (roadBottom - roadTop) * Number(cfg.laneYRatio ?? 0.48);
    const dash = Math.max(20, contract.width * 0.045);
    const gap = Math.max(26, contract.width * 0.065);
    const nodes = [];

    for (let x = 0, index = 0; x < contract.width; x += dash + gap, index += 1) {
      nodes.push(G.rect('lane_dash_' + index, {
        x,
        y,
        width: dash,
        height: 4,
        fill: theme.lane
      }));
    }

    return nodes;
  }
}
