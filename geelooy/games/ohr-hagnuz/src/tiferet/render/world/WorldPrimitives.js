/** B"H @module WorldPrimitives Flat helpers only. */
import { WORLD_COLORS as C, pick, seeded } from './WorldPalette.js';
export const pixel = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h)); };
export const glow = () => {};
export const stone = (ctx, x, y, size, seed) => { ctx.fillStyle = '#8f8a82'; ctx.beginPath(); ctx.ellipse(x, y, size * .52, size * .34, seeded(seed) * .5, 0, Math.PI * 2); ctx.fill(); pixel(ctx, x - size * .22, y - size * .12, size * .22, 2, '#c5bfb5'); };
export const flower = (ctx, x, y, size, seed) => { pixel(ctx, x, y, 2, size * .32, C.leafLight); ctx.fillStyle = pick(C.flower, seed); for (let i = 0; i < 4; i += 1) { ctx.beginPath(); ctx.arc(x + Math.cos(i * Math.PI / 2) * 3, y + Math.sin(i * Math.PI / 2) * 3, 2, 0, Math.PI * 2); ctx.fill(); } pixel(ctx, x - 1, y - 1, 2, 2, C.gold); };
export const grassBlade = (ctx, x, y, h, color = C.leaf) => { ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y - h); ctx.moveTo(x, y); ctx.lineTo(x + 2, y - h * .8); ctx.stroke(); };
