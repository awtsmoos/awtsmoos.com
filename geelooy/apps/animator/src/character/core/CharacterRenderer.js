
/* B”H */

/**
 * @class CharacterRenderer
 * @description
 * The Grand Conductor of the Character's revelation.
 * This class applies the global transformations—Position, Flip, and Weight Shift—
 * before delegating the individual layer drawing to the Manager. 
 * It ensures the character exists in the correct 'Makom' (Place) in the world.
 */
export class CharacterRenderer {
  /**
   * Brings the character from the potential state to the manifest canvas.
   * 
   * @param {CanvasRenderingContext2D} ctx - The reality engine.
   * @param {CharacterLayerManager} manager - The hierarchy of layers.
   * @param {Object} data - The soul's current state.
   */
  static draw(ctx, manager, data) {
    const { weightShift = 0 } = data.idle || {};
    const { x = 0, y = 0 } = data.position || {};
    const flipX = data.flipX || false;
    const scale = data.scale || 1.5; // Slightly larger by default for visibility
    
    ctx.save();
    
    // 1. Move to the character's designated spot in the universe
    ctx.translate(x + weightShift, y);
    
    // 2. Flip existence if needed
    if (flipX) {
      ctx.scale(-scale, scale);
    } else {
      ctx.scale(scale, scale);
    }

    // 3. Render all layers in their ordained order
    manager.draw(ctx, data);
    
    ctx.restore();
  }
}
