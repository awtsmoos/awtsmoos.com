// B"H
import { DepthLaneRegistry } from './DepthLaneRegistry.js';

/** Semantic anchors so objects touch tables, hands, and plates instead of air. */
export class StageAnchorResolver {
  static anchors = {
    floor: { x: 0, y: 210 }, tableTop: { x: 0, y: 115 },
    plateCenter: { x: -42, y: 105 }, lunchbox: { x: 82, y: 96 },
    kidHand: { x: -92, y: 122 }, guideHand: { x: 120, y: 118 }, window: { x: 0, y: -170 }
  };

  static resolve(item = {}, scene = {}) {
    const base = this.anchors[item.anchor] || this.anchors.floor;
    const lane = DepthLaneRegistry.get(item.lane);
    return {
      x: Number(item.x ?? base.x),
      y: Number(item.y ?? base.y ?? lane.y),
      scale: Number(item.scale ?? lane.scale ?? 1)
    };
  }
}
