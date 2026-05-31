/**
 * B"H
 * @module GlyphRenderer
 *
 * Chapter 45: The glyph-router stopped painting the whole world alone.
 * The Awtsmoos has no body and no form; this small dispatcher sends each
 * generated thing to its proper artist, so trees, houses, doors, signs, NPCs,
 * musagim, and mitzvah sparks all share the same polished overworld language.
 */
import { Human } from './Human.js';
import { Architecture } from './Architecture.js';
import { drawNatureObject, drawTree } from './world/NatureRenderer.js';
import { drawMitzvah, drawMusag, drawObject, drawSynagogue } from './world/ObjectRenderer.js';

const DRAWERS = {
  wall: (ctx, item, size) => Architecture.draw(ctx, item.x, item.y, size, item.rx, item.ry),
  tree: (ctx, item, size) => drawTree(ctx, item.x, item.y, size, item.seed),
  door: (ctx, item, size) => Architecture.drawDoor(ctx, item.x, item.y, size),
  npc: (ctx, item, size) => drawNpc(ctx, item.x, item.y, size, item.glyph),
  musag: (ctx, item, size) => drawMusag(ctx, item.x, item.y, size, item.glyph, item.seed),
  object: (ctx, item, size) => drawObject(ctx, item.x, item.y, size, item.glyph),
  synagogue: (ctx, item, size) => drawSynagogue(ctx, item.x, item.y, size),
  mitzvah: (ctx, item, size) => drawMitzvah(ctx, item.x, item.y, size),
  nature: (ctx, item, size) => drawNatureObject(ctx, item.x, item.y, size, item.glyph, item.seed)
};

/**
 * Draws a single object by meta-kind.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {{meta:object,glyph:string,x:number,y:number,rx:number,ry:number,seed:number}} item - Object payload.
 * @param {number} size - Tile size.
 * @returns {void}
 */
export const drawGlyphObject = (ctx, item, size) => {
  if (!item?.meta) return;
  const drawer = DRAWERS[item.meta.kind] || DRAWERS.nature;
  drawer(ctx, item, size);
};

/**
 * Draws an NPC with an animated-like light seal above the head.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} x - Screen x.
 * @param {number} y - Screen y.
 * @param {number} size - Tile size.
 * @param {string} glyph - NPC glyph.
 * @returns {void}
 */
export const drawNpc = (ctx, x, y, size, glyph) => {
  Human.draw(ctx, x, y, size, performance.now() / 900, 'd');
  ctx.save();
  ctx.fillStyle = '#fff176';
  ctx.shadowColor = '#fff176';
  ctx.shadowBlur = 10;
  ctx.font = `800 ${Math.round(size * .27)}px Georgia,serif`;
  ctx.textAlign = 'center';
  ctx.fillText(glyph, x + size / 2, y + size * .12);
  ctx.restore();
};
