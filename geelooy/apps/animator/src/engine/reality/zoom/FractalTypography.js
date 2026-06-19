
// B"H
/**
 * @file FractalTypography.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 8: THE LETTERS OF CREATION (Otiyot HaBeriah)
 * ============================================================================
 * The physical world is not made of atoms; it is made of the divine speech of 
 * the Awtsmoos. "Let there be a firmament." If you zoom in deeply enough into 
 * the bark of a tree or the brick of a wall, you will not find flat color. 
 * You will find the letters of the code that generated it.
 * 
 * THE POEM OF THE FRACTAL TEXT:
 * You zoom past the skin, past the paint and the hue,
 * To see what the universe actually drew!
 * Not pixels of color, not shapes that are flat,
 * But letters and syntax where the rendering sat.
 * The word makes the world, the string makes the stone,
 * A procedural reality upon the throne!
 * 
 * @class FractalTypography
 * @classdesc Intercepts extreme camera zooms and swaps flat fills with text patterns.
 * ============================================================================
 */

import { AwtsmoosCache } from '../../core/AwtsmoosCache.js';

export class FractalTypography {
  /**
   * @description A routing map for generating semantic textures.
   */
  static Textures = {
    brick: () => this.generateTextPattern('semantic_brick', '#2b3642', ['LET THERE BE A WALL.', 'NodeFactory.rect()', 'VirtualGraph.clip()', 'THE_TZIMTZUM_HOLDS']),
    bark: () => this.generateTextPattern('semantic_bark', '#4a2c10', ['ETZ CHAYIM HI', 'Math.cos(angle)', 'recursive_branch()']),
    flesh: () => this.generateTextPattern('semantic_flesh', '#f1c27d', ['B\'TZELEM ELOKIM', 'ViscoelasticFlesh', 'AwtsmoosMath.lerp()'])
  };

  /**
   * @function evaluateLOD
   * @description Mutates the virtual graph node style before canvas execution based on zoom.
   * @param {Object} node - The raw geometry node.
   * @param {number} zoom - The current camera magnification.
   * @returns {Object} The mutated node.
   */
  static evaluateLOD(node, zoom) {
    if (!node || !node.style) return node;

    // MACROSCOPIC TRUTH REVEALED (Zoom > 5.0)
    if (zoom > 5.0) {
      if (node.id?.includes('main_struct')) {
        node.style.fillPattern = this.Textures.brick();
      }
      if (node.id?.includes('trunk') || node.id?.includes('wood')) {
        node.style.fillPattern = this.Textures.bark();
      }
      if (node.id?.includes('face') || node.id?.includes('skin')) {
         // Only swap flesh at extreme zoom (10x)
         if (zoom > 10.0) node.style.fillPattern = this.Textures.flesh();
      }
    }

    return node;
  }

  /**
   * @function generateTextPattern
   * @description Creates an offscreen canvas patterned with the source code of reality.
   */
  static generateTextPattern(cacheId, bgColor, words) {
    return AwtsmoosCache.crystallize(cacheId, 300, 300, (ctx) => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 300, 300);

      // Faint, glowing code text
      ctx.fillStyle = 'rgba(0, 255, 204, 0.2)'; 
      ctx.font = '900 8px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      for (let y = 0; y < 300; y += 12) {
        let x = (y % 24 === 0) ? 0 : -20; // Stagger lines
        while (x < 300) {
          const word = words[Math.floor((x + y) % words.length)];
          ctx.fillText(word, x, y);
          x += ctx.measureText(word).width + 10;
        }
      }
    });
  }
}
