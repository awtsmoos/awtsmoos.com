/**
 * B"H
 * @module GlyphRenderer
 * @description Renders game objects (walls, trees, NPCs, doors, objects, musagim)
 * 
 * Chapter: The garments of all things visible.
 * 
 * Every glyph carries its own meta-record which defines how it appears.
 * This renderer reads that record and draws the appropriate garment:
 * walls with architectural dignity, trees with root and canopy, NPCs 
 * with human form and golden letter, doors with threshold, objects with
 * their sefirah-letter, and musagim with their sacred glow.
 */
import { Human } from './Human.js';
import { Architecture } from './Architecture.js';

/**
 * Draws a single game object based on its meta-kind.
 * 
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
 * @param {object} item - The item to draw, containing meta, glyph, position, etc.
 * @param {number} size - The resolution size of the tile.
 * @returns {void}
 */
export const drawGlyphObject = (ctx, item, size) => {
  // SAFETY: Ensure item and meta exist before accessing properties
  if (!item) return;
  const { meta, glyph, x, y, rx, ry, seed } = item;
  if (!meta) {
    // Graceful fallback: unknown glyph renders as simple floor
    return;
  }
  
  // Route to appropriate drawer based on meta.kind
  const kind = meta.kind;
  
  if (kind === 'wall') {
    Architecture.draw(ctx, x, y, size, rx, ry);
  } else if (kind === 'tree') {
    drawTree(ctx, x, y, size, seed);
  } else if (kind === 'door') {
    Architecture.drawDoor(ctx, x, y, size);
  } else if (kind === 'npc') {
    drawNpc(ctx, x, y, size, glyph);
  } else if (kind === 'musag') {
    drawMusag(ctx, x, y, size, glyph, seed);
  } else if (kind === 'object') {
    drawObject(ctx, x, y, size, glyph);
  } else if (kind === 'synagogue') {
    drawSynagogue(ctx, x, y, size);
  } else if (kind === 'mitzvah') {
    drawMitzvah(ctx, x, y, size);
  } else {
    // Unknown kind - do nothing, preventing crashes
  }
};

/**
 * Draws an NPC (Non-Player Character) with human form and golden glyph.
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} size - Tile resolution.
 * @param {string} glyph - The Hebrew letter representing this NPC.
 * @returns {void}
 */
export const drawNpc = (ctx, x, y, size, glyph) => {
  // Draw the human vessel
  Human.draw(ctx, x, y, size, 0, 'd');
  
  // Overlay the golden Hebrew letter
  ctx.save();
  ctx.fillStyle = '#fff176';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(glyph, x + size / 2, y + 8);
  ctx.restore();
};

/**
 * Draws a Musag (Divine Attribute) with sacred glow.
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} size - Tile resolution.
 * @param {string} glyph - The letter representing this musag.
 * @param {number} seed - Seed for procedural variation.
 * @returns {void}
 */
export const drawMusag = (ctx, x, y, size, glyph, seed = 1) => {
  ctx.save();
  
  // Translate to center of tile
  ctx.translate(x + size / 2, y + size / 2);
  
  // Outer glow
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = '#7e57c2';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.24 + (seed % 4), 0, Math.PI * 2);
  ctx.fill();
  
  // Inner ring
  ctx.strokeStyle = '#e1bee7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.36, 0, Math.PI * 2);
  ctx.stroke();
  
  // Letter
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, 0, 1);
  
  ctx.restore();
};

/**
 * Draws a quest object (bookstand, lamp, etc.)
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} size - Tile resolution.
 * @param {string} glyph - The letter representing this object.
 * @returns {void}
 */
export const drawObject = (ctx, x, y, size, glyph) => {
  ctx.save();
  
  // Base table/stand
  ctx.translate(Math.floor(x), Math.floor(y));
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(size * 0.18, size * 0.3, size * 0.64, size * 0.45);
  
  // Golden letter
  ctx.fillStyle = '#fff8e1';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, size / 2, size * 0.5);
  
  ctx.restore();
};

/**
 * Draws a tree with procedural variation based on seed.
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} size - Tile resolution.
 * @param {number} seed - Seed for procedural variation.
 * @returns {void}
 */
export const drawTree = (ctx, x, y, size, seed = 1) => {
  ctx.save();
  
  // Translate to center
  ctx.translate(x + size / 2, y + size / 2);
  
  // Trunk
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(-size / 6, 0, size / 3, size / 2);
  
  // Canopy layers (procedural colors)
  const colors = ['#1b5e20', '#2e7d32', '#388e3c', '#43a047'];
  colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
      Math.sin(i * 1.5) * size / 3,
      -size / 3 + Math.cos(i * 2) * size / 4,
      size / 2.6 + (seed % 5),
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
  
  ctx.restore();
};

/**
 * Draws a synagogue (synagogue glyph).
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} size - Tile resolution.
 * @returns {void}
 */
export const drawSynagogue = (ctx, x, y, size) => {
  ctx.save();
  
  // Building base
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(x + size * 0.1, y + size * 0.2, size * 0.8, size * 0.7);
  
  // Roof
  ctx.fillStyle = '#5d4037';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.05, y + size * 0.2);
  ctx.lineTo(x + size * 0.5, y);
  ctx.lineTo(x + size * 0.95, y + size * 0.2);
  ctx.fill();
  
  // Star of David
  ctx.fillStyle = '#fff176';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('✡', x + size / 2, y + size * 0.6);
  
  ctx.restore();
};

/**
 * Draws a mitzvah station.
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {number} size - Tile resolution.
 * @returns {void}
 */
export const drawMitzvah = (ctx, x, y, size) => {
  ctx.save();
  
  // Glowing platform
  ctx.fillStyle = '#4fc3f7';
  ctx.globalAlpha = 0.6;
  ctx.fillRect(x + size * 0.15, y + size * 0.15, size * 0.7, size * 0.7);
  
  // Inner glow
  ctx.fillStyle = '#81d4fa';
  ctx.globalAlpha = 0.8;
  ctx.fillRect(x + size * 0.25, y + size * 0.25, size * 0.5, size * 0.5);
  
  // Center symbol
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('✡', x + size / 2, y + size * 0.5 + 6);
  
  ctx.restore();
};