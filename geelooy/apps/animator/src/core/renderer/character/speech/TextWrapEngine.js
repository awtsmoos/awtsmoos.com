
// B"H
/**
 * @file TextWrapEngine.js
 * @brief THE UNDERSTANDING OF WORDS (Binat HaMilim).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 8: THE SEPARATION OF STRINGS
 * ═══════════════════════════════════════════════════════════════
 * Because our VirtualGraph text nodes are pure JSON, they do not 
 * have access to the browser's `ctx.measureText` natively during 
 * the emanation phase. 
 * 
 * This engine provides a deterministic, character-based wrapping 
 * algorithm. It prevents words from being sliced in half, forcing 
 * line breaks gracefully to ensure the Divine Speech fits inside 
 * the geometric boundaries of the bubble.
 * 
 * @class TextWrapEngine
 */
export class TextWrapEngine {
  /**
   * @function wrap
   * @description Splits a long string into an array of contained lines.
   * @param {string} text - The raw speech string.
   * @param {number} maxChars - The limit of characters per line.
   * @returns {Array<string>} The perfectly severed lines.
   */
  static wrap(text, maxChars = 24) {
    if (!text) return [];

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      // If adding the next word exceeds the bounds
      if ((currentLine + word).length > maxChars) {
        // Push the accumulated line and start fresh
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });

    // Push the final remaining fragment
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines;
  }
}
