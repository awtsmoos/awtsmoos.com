import { WorldData } from '../../data/WorldData.js';
import { State } from '../../binah/State.js';
import { WORLD_COLORS as C, seeded } from './world/WorldPalette.js';
import { glow, pixel } from './world/WorldPrimitives.js';

/**
 * B"H
 * @class Architecture
 *
 * Chapter 65: The roof was returned to the top, and the walls stood upright.
 * The Awtsmoos has no body and no form; this renderer now refuses the old lie
 * where side walls became roof strips. Top-edge tiles roof. Everything below
 * becomes stone, trim, threshold, shadow, and door, so homes read as homes.
 */
export class Architecture {
  static draw(ctx, x, y, size, rx, ry) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    ctx.beginPath();
    ctx.rect(0, 0, size + 1, size + 1);
    ctx.clip();
    const n = this.neighbors(rx, ry);
    if (!n.aboveWall) this.drawRoof(ctx, size, rx, ry, n);
    else this.drawFacade(ctx, size, rx, ry, n);
    ctx.restore();
  }

  static neighbors(rx, ry) {
    const map = WorldData[State.MapId] || [];
    const at = (x, y) => y >= 0 && y < map.length ? [...map[y]][x] : null;
    const wall = g => ['W', '☗', '★', '♜'].includes(g);
    return {
      aboveWall: wall(at(rx, ry - 1)), belowWall: wall(at(rx, ry + 1)),
      leftWall: wall(at(rx - 1, ry)), rightWall: wall(at(rx + 1, ry))
    };
  }

  static drawRoof(ctx, size, rx, ry, n) {
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, '#8d6546');
    g.addColorStop(.45, '#5a3929');
    g.addColorStop(1, '#2e1b17');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    this.roofShingles(ctx, size, rx, ry);
    pixel(ctx, 0, 0, size, 5, 'rgba(255,228,150,.18)');
    pixel(ctx, 0, size - 6, size, 6, 'rgba(0,0,0,.3)');
    if (!n.leftWall) pixel(ctx, 0, 0, 5, size, 'rgba(0,0,0,.22)');
    if (!n.rightWall) pixel(ctx, size - 5, 0, 5, size, 'rgba(255,230,160,.12)');
  }

  static roofShingles(ctx, size, rx, ry) {
    ctx.strokeStyle = 'rgba(20,9,5,.48)';
    ctx.lineWidth = 2;
    const sw = size / 3;
    const sh = size / 4;
    for (let row = 0; row < 5; row += 1) {
      const offset = row % 2 ? 0 : sw / 2;
      for (let c = -1; c < 4; c += 1) {
        ctx.beginPath();
        ctx.arc(c * sw + offset, row * sh, sw * .64, 0, Math.PI);
        ctx.stroke();
      }
    }
    if (seeded(rx * 7 + ry * 11) > .72) pixel(ctx, size * .18, size * .22, size * .45, 2, 'rgba(255,210,120,.14)');
  }

  static drawFacade(ctx, size, rx, ry, n) {
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, '#f2ebe3');
    g.addColorStop(.62, '#d7cec7');
    g.addColorStop(1, '#b9ada7');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    this.bricks(ctx, size, rx, ry);
    this.facadeEdges(ctx, size, n);
    if (this.shouldWindow(rx, ry, n)) this.window(ctx, size);
    if (!n.belowWall) this.foundation(ctx, size);
  }

  static facadeEdges(ctx, size, n) {
    if (!n.leftWall) pixel(ctx, 0, 0, 4, size, 'rgba(0,0,0,.24)');
    if (!n.rightWall) pixel(ctx, size - 4, 0, 4, size, 'rgba(255,255,255,.14)');
    pixel(ctx, 0, 0, size, 3, 'rgba(255,255,255,.16)');
    pixel(ctx, 0, size - 4, size, 4, 'rgba(0,0,0,.14)');
  }

  static bricks(ctx, size, rx, ry) {
    const bw = size / 3;
    const bh = size / 4;
    ctx.strokeStyle = C.stoneLine;
    ctx.lineWidth = 1;
    for (let r = 0; r < 4; r += 1) {
      const shift = r % 2 ? 0 : bw / 2;
      for (let c = -1; c < 4; c += 1) ctx.strokeRect(c * bw + shift, r * bh, bw, bh);
    }
    if (seeded(rx * 31 + ry * 17) > .8) pixel(ctx, size * .18, size * .58, size * .32, 2, 'rgba(0,0,0,.07)');
  }

  static foundation(ctx, size) {
    pixel(ctx, 0, size * .78, size, size * .22, 'rgba(97,83,78,.18)');
    pixel(ctx, size * .08, size * .84, size * .84, 3, 'rgba(255,255,255,.1)');
  }

  static shouldWindow(rx, ry, n) {
    if (n.leftWall && n.rightWall) return false;
    if (!n.belowWall) return false;
    return seeded(rx * 19 + ry * 23) > .9;
  }

  static window(ctx, size) {
    pixel(ctx, size * .28, size * .24, size * .44, size * .36, '#1c1412');
    pixel(ctx, size * .32, size * .3, size * .16, size * .23, 'rgba(255,210,105,.5)');
    pixel(ctx, size * .52, size * .3, size * .16, size * .23, 'rgba(255,210,105,.34)');
    ctx.strokeStyle = '#3a2219';
    ctx.strokeRect(size * .28, size * .24, size * .44, size * .36);
  }

  static drawDoor(ctx, x, y, size) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    this.drawFacade(ctx, size, 2, 7, { leftWall: true, rightWall: true, aboveWall: true, belowWall: false });
    pixel(ctx, size * .1, size * .18, size * .8, size * .84, 'rgba(0,0,0,.44)');
    pixel(ctx, size * .19, size * .25, size * .62, size * .75, C.wood);
    pixel(ctx, size * .25, size * .31, size * .18, size * .58, C.woodLight);
    pixel(ctx, size * .54, size * .31, size * .18, size * .58, '#4b2a1d');
    pixel(ctx, size * .18, size * .18, size * .64, size * .08, '#2a1712');
    glow(ctx, size * .73, size * .58, size * .2, 'rgba(255,177,0,.5)');
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.arc(size * .73, size * .58, size * .055, 0, Math.PI * 2);
    ctx.fill();
    pixel(ctx, size * .1, size * .94, size * .8, size * .06, 'rgba(0,0,0,.34)');
    ctx.restore();
  }
}
