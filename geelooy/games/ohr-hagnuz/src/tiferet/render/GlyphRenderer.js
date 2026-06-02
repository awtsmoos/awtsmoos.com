/** B"H @module GlyphRenderer Flat visible object dispatcher. */
import { Human } from './Human.js';
import { Architecture } from './Architecture.js';
import { drawNatureObject, drawTree } from './world/NatureRenderer.js';
import { drawMitzvah, drawMusag, drawObject, drawSynagogue } from './world/ObjectRenderer.js';
const DRAWERS = { wall: (ctx, item, size) => Architecture.draw(ctx, item.x, item.y, size, item.rx, item.ry), tree: (ctx, item, size) => drawTree(ctx, item.x, item.y, size, item.seed), door: (ctx, item, size) => Architecture.drawDoor(ctx, item.x, item.y, size), npc: (ctx, item, size) => drawNpc(ctx, item.x, item.y, size, item.glyph), musag: (ctx, item, size) => drawMusag(ctx, item.x, item.y, size, item.glyph, item.seed), object: (ctx, item, size) => drawObject(ctx, item.x, item.y, size, item.glyph), synagogue: (ctx, item, size) => drawSynagogue(ctx, item.x, item.y, size), mitzvah: (ctx, item, size) => drawMitzvah(ctx, item.x, item.y, size), nature: (ctx, item, size) => drawNatureObject(ctx, item.x, item.y, size, item.glyph, item.seed) };
export const drawGlyphObject = (ctx, item, size) => { const drawer = DRAWERS[item.meta.kind] || DRAWERS.object; drawer(ctx, item, size); };
export const drawNpc = (ctx, x, y, size, glyph) => { Human.draw(ctx, x, y, size, glyph); };
