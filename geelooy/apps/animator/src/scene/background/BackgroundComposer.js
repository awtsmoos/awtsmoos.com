// B"H
import { SceneShapeKit as S } from './SceneShapeKit.js';
import { SkyLayer } from './layers/SkyLayer.js';
import { CloudLayer } from './layers/CloudLayer.js';
import { BuildingLayer } from './layers/BuildingLayer.js';
import { WindowLayer } from './layers/WindowLayer.js';
import { LampLayer } from './layers/LampLayer.js';
import { TreeLayer } from './layers/TreeLayer.js';
import { RoadLayer } from './layers/RoadLayer.js';
import { DetailLayer } from './layers/DetailLayer.js';

/**
 * @file BackgroundComposer.js
 * @description
 * ============================================================================
 * CHAPTER: THE LAYERED WORLD THAT BANISHED EMPTY SPACE
 * ============================================================================
 *
 * The background is no longer a lonely rectangle. It is composed from layers,
 * each in its own file, each data-driven.
 *
 * @class BackgroundComposer
 */
export class BackgroundComposer {
  /**
   * Builds full scene background.
   *
   * @param {Object} scene - Scene data.
   * @returns {Object} Background graph.
   */
  static build(scene = {}) {
    return S.group('composed_background', null, [
      SkyLayer.build(scene),
      CloudLayer.build(scene),
      BuildingLayer.build(scene),
      WindowLayer.build(scene),
      LampLayer.build(scene),
      TreeLayer.build(scene),
      RoadLayer.build(scene),
      DetailLayer.build(scene)
    ]);
  }
}