
// B"H
import { CharacterRenderDataHydrator } from './CharacterRenderDataHydrator.js';
import { StableCharacterRenderAdapter } from '../../../../character/factory/stable/StableCharacterRenderAdapter.js';
import { HitRegionStore } from '../../../../interaction/HitRegionStore.js';
import { BikeEntityAdapter } from '../../../../vehicles/bike/BikeEntityAdapter.js';
import { PropBuilder } from '../../props/PropBuilder.js';

/**
 * @file EntityPhase.js
 * @description
 * ============================================================================
 * CHAPTER: REAL ENTITIES ONLY
 * ============================================================================
 *
 * This phase no longer invents placeholder people, empty markers, crowd layout,
 * emergency humans, or alternate screen-space actors.
 *
 * Characters are rendered only through the real StableCharacterAssembler path.
 * If a real character fails, it is skipped and logged. It is not replaced by a
 * fake body.
 *
 * @module EntityPhase
 */



/**
 * @class EntityPhase
 * @description
 * Builds real entity graph nodes only.
 */
export class EntityPhase {
  /**
   * Builds all entity nodes for the current frame.
   *
   * @param {Object} state - App state.
   * @param {Object} sceneData - Scene data.
   * @param {number} realTime - RAF time.
   * @param {number} directorTime - Director elapsed time.
   * @param {Object} ctx - Render context.
   * @returns {Array<Object>} VirtualGraph nodes.
   */
  static build(state, sceneData, realTime, directorTime, ctx) {
    const hitRegions = HitRegionStore.begin(state);
    const nodes = [];

    this.addBikes(nodes, hitRegions, state, sceneData, realTime, directorTime, ctx);
    this.addCharacters(nodes, hitRegions, state, sceneData, realTime, directorTime, ctx);
    this.addProps(nodes, state);

    HitRegionStore.finish(state, hitRegions);

    return nodes;
  }

  /**
   * Adds real character nodes using original state positions and real assembler.
   *
   * @param {Array<Object>} nodes - Output nodes.
   * @param {Array<Object>} hitRegions - Output hit regions.
   * @param {Object} state - App state.
   * @param {Object} sceneData - Scene data.
   * @param {number} realTime - RAF time.
   * @param {number} directorTime - Director time.
   * @param {Object} ctx - Render context.
   * @returns {void}
   */
  static addCharacters(nodes, hitRegions, state, sceneData, realTime, directorTime, ctx) {
    const characters = state.get('characters') || {};
    const props = state.get('props') || {};
    const entries = Object.entries(characters);

    for (let index = 0; index < entries.length; index += 1) {
      const [id, character] = entries[index];

      const hydrated = CharacterRenderDataHydrator.hydrate({ id, ...character }, {
        realTime,
        directorTime,
        camera: state.get('camera'),
        activeDialogue: state.get('activeDialogue'),
        index,
        characters,
        props,
        scene: sceneData
      });

      hydrated.id = id;
      if (hydrated.hiddenByStaging) continue;
      hydrated.realTime = realTime;
      hydrated.time = realTime;
      hydrated.depth = Number(character.depth ?? character.z ?? index);

      const result = StableCharacterRenderAdapter.render(hydrated, ctx, state);

      if (result && result.node) {
        nodes.push(result.node);
      }

      if (result && result.hitRegion) {
        HitRegionStore.add(hitRegions, result.hitRegion);
      }
    }
  }

  /**
   * Adds visible prop nodes once, so lamps and hand props do not double-brighten.
   *
   * @param {Array<Object>} nodes - Output nodes.
   * @param {Object} state - App state.
   * @returns {void}
   */
  static addProps(nodes, state) {
    const props = state.get('props') || {};
    const list = Array.isArray(props) ? props : Object.values(props);
    nodes.push(...PropBuilder.buildAll(list, 'front'));
  }

  /**
   * Adds visible prop nodes once, so lamps and hand props do not double-brighten.
   *
   * @param {Array<Object>} nodes - Output nodes.
   * @param {Object} state - App state.
   * @returns {void}
   */
  static addProps(nodes, state) {
    const props = state.get('props') || {};
    const list = Array.isArray(props) ? props : Object.values(props);
    nodes.push(...PropBuilder.buildAll(list, 'front'));
  }

  /**
   * Adds bike nodes through the real bike adapter only.
   *
   * @param {Array<Object>} nodes - Output nodes.
   * @param {Array<Object>} hitRegions - Hit regions.
   * @param {Object} state - State.
   * @param {Object} sceneData - Scene data.
   * @param {number} realTime - Real time.
   * @param {number} directorTime - Director time.
   * @param {Object} ctx - Context.
   * @returns {void}
   */
  static addBikes(nodes, hitRegions, state, sceneData, realTime, directorTime, ctx) {
    const raw = state.get('bikes') || sceneData.bikes || {};
    const entries = Array.isArray(raw) ? raw.map(b => [b.id, b]) : Object.entries(raw);

    for (let index = 0; index < entries.length; index += 1) {
      const [id, bike] = entries[index];

      try {
        const result = BikeEntityAdapter.render({ id, ...bike }, {
          realTime,
          directorTime,
          state,
          sceneData,
          ctx,
          index
        });

        if (result && result.node) nodes.push(result.node);
        if (result && result.hitRegion) HitRegionStore.add(hitRegions, result.hitRegion);
      } catch (error) {
        console.warn('B"H - Real bike renderer skipped after failure. No placeholder bike drawn.', error);
      }
    }
  }
}
