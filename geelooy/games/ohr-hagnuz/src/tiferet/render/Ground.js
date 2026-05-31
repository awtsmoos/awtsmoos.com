/**
 * B"H
 * @module Ground
 *
 * Chapter 66: The grass stopped shouting in rectangles.
 * The Awtsmoos has no body and no form; each tile now carries a calmer pixel
 * garden: broad coherent greens, small blades, rare flowers, and road dust that
 * supports the mockup instead of fighting it.
 */
import { WORLD_COLORS as C, pick, seeded } from './world/WorldPalette.js';
import { flower, glow, grassBlade, pixel, stone } from './world/WorldPrimitives.js';

export class Ground {
  static draw(ctx, x, y, size, char, seed) {
    const fx = Math.floor(x);
    const fy = Math.floor(y);
    const s = Math.max(8, Math.floor(size + 1));
    if (char === '2' || ['⇧', '⇩', '⇦', '⇨'].includes(char)) this.drawPath(ctx, fx, fy, s, seed);
    else if (char === '.' || char === ' ') this.drawFloor(ctx, fx, fy, s, seed);
    else this.drawGrass(ctx, fx, fy, s, seed);
  }

  static drawGrass(ctx, x, y, size, seed) {
    pixel(ctx, x, y, size, size, pick(C.grass, seed));
    this.softShade(ctx, x, y, size);
    this.smallMoss(ctx, x, y, size, seed);
    for (let i = 0; i < 4; i += 1) this.blade(ctx, x, y, size, seed + i * 13);
    if (seeded(seed + 44) > .9) flower(ctx, x + size * .55, y + size * .6, size, seed);
    if (seeded(seed + 77) > .965) glow(ctx, x + size * .55, y + size * .35, size * .22, 'rgba(255,236,130,.22)');
  }

  static drawFloor(ctx, x, y, size, seed) {
    pixel(ctx, x, y, size, size, '#143125');
    this.softShade(ctx, x, y, size);
    for (let i = 0; i < 3; i += 1) this.smallMoss(ctx, x, y, size, seed + i * 7);
    if (seeded(seed + 5) > .82) stone(ctx, x + size * .55, y + size * .58, size * .24, seed);
  }

  static drawPath(ctx, x, y, size, seed) {
    pixel(ctx, x, y, size, size, C.path);
    const g = ctx.createLinearGradient(x, y, x, y + size);
    g.addColorStop(0, 'rgba(255,230,170,.12)');
    g.addColorStop(.7, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(40,22,10,.18)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, size, size);
    for (let i = 0; i < 8; i += 1) {
      const px = x + seeded(seed + i * 3) * size;
      const py = y + seeded(seed + i * 5) * size;
      pixel(ctx, px, py, 1 + (i % 2), 1 + (i % 3 === 0 ? 1 : 0), i % 2 ? C.pathDark : C.pathLight);
    }
  }

  static softShade(ctx, x, y, size) {
    const g = ctx.createLinearGradient(x, y, x + size, y + size);
    g.addColorStop(0, 'rgba(255,255,255,.04)');
    g.addColorStop(.65, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,.13)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, size, size);
  }

  static smallMoss(ctx, x, y, size, seed) {
    const w = size * (.12 + seeded(seed) * .12);
    const h = size * (.08 + seeded(seed + 1) * .1);
    const px = x + seeded(seed + 2) * (size - w);
    const py = y + seeded(seed + 3) * (size - h);
    ctx.fillStyle = seeded(seed + 4) > .5 ? 'rgba(90,150,82,.2)' : 'rgba(8,40,30,.16)';
    ctx.fillRect(px, py, w, h);
  }

  static blade(ctx, x, y, size, seed) {
    const bx = x + 7 + seeded(seed) * (size - 14);
    const by = y + 10 + seeded(seed + 1) * (size - 14);
    grassBlade(ctx, bx, by, 3 + seeded(seed + 2) * 5, seeded(seed + 3) > .5 ? C.leaf : C.leafLight);
  }
}
