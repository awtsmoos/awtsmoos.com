
// B"H
import { WorldStageContract } from '../contract/WorldStageContract.js';
import { CityParkDayPreset } from '../presets/CityParkDayPreset.js';

/**
 * @file SceneRenderContext.js
 * @description
 * Builds the one scene context passed into every modular background renderer.
 */

/**
 * @class SceneRenderContext
 * @description Creates a normalized context for scene layer modules.
 */
export class SceneRenderContext {
  /**
   * Creates the scene render context.
   *
   * @param {Object} args - Context args.
   * @returns {Object} Scene context.
   */
  static create(args = {}) {
    const contract = WorldStageContract.resolve(args.ctx || {});
    const sceneData = args.sceneData || {};
    const rawPreset = sceneData.scenePreset || sceneData.preset || CityParkDayPreset;
    const preset = {
      ...rawPreset,
      skyline: { ...(rawPreset.skyline || {}), ...(sceneData.skyline || {}) },
      park: { ...(rawPreset.park || {}), ...(sceneData.park || {}) },
      street: { ...(rawPreset.street || {}), ...(sceneData.street || {}) },
      theme: { ...(rawPreset.theme || {}), ...(sceneData.theme || {}) }
    };

    return {
      contract,
      sceneData,
      preset,
      sequence: args.sequence || null,
      ctx: args.ctx || {},
      realTime: Number(args.realTime) || 0,
      directorTime: Number(args.directorTime) || 0,
      camera: args.camera || {},
      state: args.state || null,
      theme: {
        ...(CityParkDayPreset.theme || {}),
        ...(preset.theme || {}),
        ...(sceneData.theme || {})
      }
    };
  }
}
