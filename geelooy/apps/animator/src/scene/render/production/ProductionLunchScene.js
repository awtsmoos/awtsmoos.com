// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/** World-coordinate kitchen set: the camera moves through this room. */
export class ProductionLunchScene {
  static build() {
    return G.group('REAL_CHARACTER_CAMERA_BOUND_KITCHEN_STAGE', null, [
      ...this.backWall(),
      ...this.window(),
      ...this.shelf(),
      ...this.prepTable(),
      ...this.floor(),
      ...this.depthMarks()
    ]);
  }

  static backWall() {
    return [
      G.rect('world_kitchen_wall_upper', { x: -900, y: -420, width: 1800, height: 520, fill: '#ffe0a8' }),
      G.rect('world_kitchen_wall_lower', { x: -900, y: 100, width: 1800, height: 128, fill: '#fff0c9' }),
      G.rect('world_kitchen_baseboard', { x: -900, y: 224, width: 1800, height: 8, fill: '#c47a36' })
    ];
  }

  static window() {
    return [
      G.rect('world_window_frame', { x: 190, y: -270, width: 210, height: 170, fill: '#70421e' }),
      G.rect('world_window_sky', { x: 202, y: -258, width: 186, height: 146, fill: '#8fd7ff' }),
      G.rect('world_window_cross_v', { x: 292, y: -258, width: 6, height: 146, fill: '#70421e' }),
      G.rect('world_window_cross_h', { x: 202, y: -188, width: 186, height: 6, fill: '#70421e' }),
      G.circle('world_window_sun', { x: 344, y: -224, radius: 18, fill: '#ffe36c' })
    ];
  }

  static shelf() {
    return [
      G.rect('world_shelf_plank', { x: -360, y: -84, width: 270, height: 8, fill: '#8f572c' }),
      G.rect('world_shelf_red_jar', { x: -330, y: -116, width: 20, height: 32, fill: '#d9443b' }),
      G.rect('world_shelf_green_jar', { x: -260, y: -108, width: 20, height: 24, fill: '#62b85f' }),
      G.rect('world_shelf_yellow_jar', { x: -190, y: -112, width: 26, height: 28, fill: '#f2ce68' })
    ];
  }

  static prepTable() {
    return [
      G.rect('world_counter_back_lip', { x: -760, y: 92, width: 1520, height: 10, fill: '#cf8a47' }),
      G.rect('world_counter_top', { x: -760, y: 104, width: 1520, height: 34, fill: '#cc8240' }),
      G.rect('world_counter_face', { x: -760, y: 136, width: 1520, height: 132, fill: '#a76331' }),
      G.ellipse('world_counter_surface_shadow', { x: 0, y: 123, radiusX: 170, radiusY: 14, fill: 'rgba(92,47,12,0.16)' })
    ];
  }

  static floor() {
    return [
      G.rect('world_kitchen_floor', { x: -900, y: 268, width: 1800, height: 420, fill: '#d69a58' }),
      G.ellipse('world_floor_soft_rug', { x: 8, y: 376, radiusX: 285, radiusY: 36, fill: 'rgba(110,57,15,0.18)' })
    ];
  }

  static depthMarks() {
    return [
      G.rect('world_floor_back_edge', { x: -900, y: 266, width: 1800, height: 4, fill: '#9d5d2b' }),
      G.rect('world_counter_front_edge', { x: -760, y: 136, width: 1520, height: 5, fill: '#8f4e24' })
    ];
  }
}
