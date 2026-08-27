// B"H
import { CinematicShotKind } from '../../../../cinema/CinematicShotKind.js';

/**
 * @file CinematicSceneTreatment.js
 * @description
 * Chapter: The world became a movie set instead of a wallpaper.
 * Shot grammar now changes the background, contrast, stage density, and focus.
 * Closeups push the city back, action shots clear the lane, and wide shots keep
 * geography readable for full production staging.
 */
export class CinematicSceneTreatment {
  /**
   * Applies scene treatment for the active camera.
   *
   * @param {Object} sceneData - Scene data.
   * @param {Object} cam - Camera.
   * @returns {Object} Treated scene data.
   */
  static apply(sceneData = {}, cam = {}) {
    const kind = this.kind(cam);
    const base = {
      ...sceneData,
      cinematicTreatment: kind,
      filmGrain: kind === 'close' ? 0.04 : 0.02,
      vignette: kind === 'wide' ? 0.08 : 0.18
    };

    if (kind === 'close') return this.close(base);
    if (kind === 'action') return this.action(base);
    if (kind === 'medium') return this.medium(base);
    return this.wide(base);
  }

  /** @param {Object} cam @returns {string} */
  static kind(cam = {}) {
    const kind = CinematicShotKind.resolve(cam);
    if (kind === 'close') return 'close';
    if (kind === 'action') return 'action';
    if (kind === 'walk' || kind === 'two' || kind === 'medium') return 'medium';
    return 'wide';
  }

  /** @param {Object} scene @returns {Object} */
  static wide(scene) {
    return {
      ...scene,
      backgroundFocus: 'geography',
      skyline: { ...(scene.skyline || {}), count: 10, minHeightRatio: 0.12, maxHeightRatio: 0.28 },
      park: { ...(scene.park || {}), treeCount: 7, benchCount: 2 },
      colorGrade: { contrast: 1.0, saturation: 1.0, exposure: 1.0 }
    };
  }

  /** @param {Object} scene @returns {Object} */
  static medium(scene) {
    return {
      ...scene,
      backgroundFocus: 'reducedStage',
      skyline: { ...(scene.skyline || {}), count: 7, minHeightRatio: 0.09, maxHeightRatio: 0.20 },
      park: { ...(scene.park || {}), treeCount: 4, benchCount: 1 },
      colorGrade: { contrast: 1.06, saturation: 1.04, exposure: 1.02 }
    };
  }

  /** @param {Object} scene @returns {Object} */
  static action(scene) {
    return {
      ...scene,
      backgroundFocus: 'clearLane',
      skyline: { ...(scene.skyline || {}), count: 5, minHeightRatio: 0.08, maxHeightRatio: 0.18 },
      park: { ...(scene.park || {}), treeCount: 2, benchCount: 0 },
      colorGrade: { contrast: 1.11, saturation: 1.08, exposure: 1.03 }
    };
  }

  /** @param {Object} scene @returns {Object} */
  static close(scene) {
    return {
      ...scene,
      backgroundFocus: 'softPortrait',
      skyline: { ...(scene.skyline || {}), count: 4, minHeightRatio: 0.06, maxHeightRatio: 0.14 },
      park: { ...(scene.park || {}), treeCount: 2, benchCount: 0 },
      colorGrade: { contrast: 1.14, saturation: 1.03, exposure: 1.06 }
    };
  }
}
