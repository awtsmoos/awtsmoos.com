// B"H
import { SceneComposer } from '../../../../scene/core/SceneComposer.js';
import { ProductionRoomBackdrop } from '../../scene/productionRoom/ProductionRoomBackdrop.js';
import { VividParkWorld } from '../../scene/worlds/VividParkWorld.js';

/**
 * Scene phase: chooses the revealed world before entities enter the frame.
 */
export class ScenePhase {
  static build(sceneData = {}, sequence = {}, ctx = {}, realTime = 0, directorTime = 0, camera = {}, state = null) {
    const style = this.style(sceneData, sequence);
    if (this.isParkWorld(style, sceneData, sequence)) return VividParkWorld.build(ctx, camera);
    if (/goal_board|warm_study|production_room|scholar/i.test(style)) return ProductionRoomBackdrop.build(ctx, camera);

    try {
      const modular = SceneComposer.build({ sceneData, sequence, ctx, realTime, directorTime, camera, state });
      if (modular && !this.isEmpty(modular)) return modular;
    } catch (error) {
      console.warn('B"H scene composer fallback', error);
    }

    return this.fallback(ctx, camera);
  }

  static style(sceneData = {}, sequence = {}) {
    return sceneData?.style || sceneData?.id || sequence?.scene?.style || sequence?.style || sequence?.id || '';
  }

  static isParkWorld(style = '', sceneData = {}, sequence = {}) {
    const text = `${style} ${sceneData?.title || ''} ${sceneData?.theme || ''} ${sequence?.id || ''}`;
    return /authored_world_2d|healthy|lunch|park|outdoor|picnic/i.test(text);
  }

  static isEmpty(node) {
    return !node || !Array.isArray(node.children) || node.children.length === 0;
  }

  static fallback(ctx = {}, camera = {}) {
    return VividParkWorld.build(ctx, camera);
  }
}
