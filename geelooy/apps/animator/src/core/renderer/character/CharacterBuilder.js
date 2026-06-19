// B"H
import { RealismEngine } from './realism/RealismEngine.js';
import { StableCharacterAssembler } from '../../../character/factory/stable/StableCharacterAssembler.js';
import { SpeechBubbleFactory } from './speech/SpeechBubbleFactory.js';
import { AutoLifeDirector } from './AutoLifeDirector.js';

/**
 * @file CharacterBuilder.js
 * @description
 * ============================================================================
 * CHAPTER: THE ONLY CHARACTER DOORWAY
 * ============================================================================
 *
 * EntityPhase imports this file directly. It enriches character data, then
 * passes it into the stable assembler. No other broken character factory route
 * is allowed to draw.
 *
 * @class CharacterBuilder
 */
export class CharacterBuilder {
  /**
   * Builds all characters.
   *
   * @param {Object} characters - Character map.
   * @param {boolean} isWalking - Global walking flag.
   * @param {boolean} isTalking - Global talking flag.
   * @param {number} realTime - RAF time.
   * @param {number} directorTime - Director time.
   * @param {Object} appState - State.
   * @param {number} canvasW - Canvas width.
   * @param {number} canvasH - Canvas height.
   * @returns {Array<Object>} Nodes.
   */
  static buildAll(characters, isWalking, isTalking, realTime, directorTime, appState, canvasW, canvasH) {
    const nodes = [];
    Object.keys(characters || {}).forEach((id, index) => {
      const source = characters[id];
      if (!source) return;

      const data = { ...source, id };
      data._renderTime = realTime;
      data._lastDirectorTime = directorTime;
      data._index = index;

      if (isWalking) data.isWalking = true;
      if (isTalking) data.isTalking = true;

      AutoLifeDirector.apply(data, realTime, directorTime, index);

      const processed = RealismEngine.process(data, realTime, directorTime, appState);
      const node = StableCharacterAssembler.assemble(processed);

      if (node) nodes.push(node);

      if (processed.speech && processed.isTalking) {
        const bubble = SpeechBubbleFactory.build(processed, canvasW, canvasH);
        if (bubble) nodes.push(bubble);
      }
    });

    return nodes;
  }
}