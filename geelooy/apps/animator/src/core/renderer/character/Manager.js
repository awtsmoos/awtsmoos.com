
import { RealismEngine } from './realism/RealismEngine.js';
import { SpeechBubble } from '../../generators/speech.js';

/**
 * @file Manager.js (CharacterManager)
 * @description
 * THE GATHERER OF SPARKS (Birur Nitzotzot).
 * This class orchestrates the rendering of ALL characters in the scene.
 * It ensures they are sorted by depth and that the 'Breath of Life' 
 * (RealismEngine) is applied to each one before they are drawn.
 */

export class CharacterRenderer {
  /**
   * Renders the complete assembly of characters.
   * 
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   * @param {Object} characters - Map of character data.
   * @param {boolean} isWalkingGlobal - Global walking override.
   * @param {boolean} isTalkingGlobal - Global talking override.
   * @param {number} realTime - System clock.
   * @param {number} directorTime - Timeline clock.
   * @param {boolean} isPlaying - Whether time is flowing in the NLE.
   * @param {StateManager} state - Global application state.
   * @param {CharacterActor} actorPrototype - The instance used for drawing.
   */
  static render(ctx, characters, isWalkingGlobal, isTalkingGlobal, realTime, directorTime, isPlaying, state, actorPrototype) {
    if (!characters) return;

    // 1. SORT THE SOULS BY DEPTH (Y-Coordinate)
    // Characters further down the screen (higher Y) are in front.
    const charArray = Object.entries(characters).map(([id, data]) => ({ id, ...data }));
    charArray.sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0));

    charArray.forEach(data => {
      // 2. APPLY GLOBAL OVERRIDES
      if (isWalkingGlobal) data.isWalking = true;
      if (isTalkingGlobal) data.isTalking = true;

      // 3. INJECT THE BREATH OF REALISM
      // The RealismEngine calculates head tilts, breathing, and phonetic mouth shapes.
      const processedData = RealismEngine.process(
        data, 
        realTime, 
        isPlaying ? directorTime : realTime,
        state
      );

      // 4. DRAW THE MANIFEST VESSEL
      // We use the singular actorPrototype to execute the manager-based drawing.
      if (actorPrototype) {
        actorPrototype.draw(ctx, processedData);
      }

      // 5. THE REVEALED WORD (Speech Bubble)
      if (processedData.speech && isPlaying) {
        ctx.save();
        ctx.translate(processedData.position.x, processedData.position.y);
        // Correct the flip for text boxes
        if (processedData.flipX) ctx.scale(-1, 1);
        SpeechBubble.draw(ctx, 0, 0, processedData.speech);
        ctx.restore();
      }
    });
  }
}
