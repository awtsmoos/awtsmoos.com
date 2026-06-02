import { WorldData } from '../../data/WorldData.js';
import { State } from '../../binah/State.js';

/**
 * B"H
 * @class Architecture
 * @description Ultra-simple stable house and wall tiles.
 *
 * Chapter 117: The houses stopped pretending to be a thousand fragments. The
 * Awtsmoos grants the palace, but the mobile canvas receives one honest block at
 * a time: roof, stone, seam, door. No scallops, no clipped roof math, no broken
 * ghost rectangles floating across the village.
 */
export class Architecture {
  /** @returns {void} */
  static draw(ctx, x, y, size, rx, ry) {
    const n = this.neighbors(rx, ry);
    const roof = !n.aboveWall;
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    if (roof) this.roof(ctx, size, n);
    else this.wall(ctx, size, n, rx, ry);
    ctx.restore();
  }

  /** @returns {{aboveWall:boolean,belowWall:boolean,leftWall:boolean,rightWall:boolean}} */
  static neighbors(rx, ry) {
    const map = WorldData[State.MapId] || [];
    const at = (x, y) => y >= 0 && y < map.length ? [...map[y]][x] : null;
    const wall = glyph => ['W', '☗', '★', '♜'].includes(glyph);
    return {
      aboveWall: wall(at(rx, ry - 1)),
      belowWall: wall(at(rx, ry + 1)),
      leftWall: wall(at(rx - 1, ry)),
      rightWall: wall(at(rx + 1, ry))
    };
  }

  /** @returns {void} */
  static roof(ctx, size, n) {
    ctx.fillStyle = '#7a4a2a';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#9b6640';
    ctx.fillRect(0, 0, size, 8);
    ctx.fillStyle = '#57321f';
    ctx.fillRect(0, size - 8, size, 8);
    ctx.strokeStyle = '#4a2a1b';
    ctx.lineWidth = 2;
    for (let y = 12; y < size; y += 13) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y + 4);
      ctx.stroke();
    }
    if (!n.leftWall) this.edge(ctx, 0, size, '#3a2117');
    if (!n.rightWall) this.edge(ctx, size - 4, size, '#b18058');
  }

  /** @returns {void} */
  static wall(ctx, size, n, rx, ry) {
    ctx.fillStyle = '#d8d0c6';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#a79d94';
    ctx.lineWidth = 1;
    const bw = size / 2;
    const bh = size / 4;
    for (let row = 0; row < 4; row += 1) {
      const offset = row % 2 ? 0 : -bw / 2;
      for (let col = 0; col < 3; col += 1) ctx.strokeRect(offset + col * bw, row * bh, bw, bh);
    }
    ctx.fillStyle = '#f4eee6';
    ctx.fillRect(0, 0, size, 3);
    ctx.fillStyle = '#b8aea6';
    ctx.fillRect(0, size - 4, size, 4);
    if (!n.leftWall) this.edge(ctx, 0, size, '#948982');
    if (!n.rightWall) this.edge(ctx, size - 4, size, '#efe8df');
    if (!n.belowWall && ((rx + ry) % 5 === 0)) this.window(ctx, size);
  }

  /** @returns {void} */
  static edge(ctx, x, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, 4, size);
  }

  /** @returns {void} */
  static window(ctx, size) {
    const x = size * .28;
    const y = size * .22;
    const w = size * .44;
    const h = size * .34;
    ctx.fillStyle = '#201714';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#ffd46b';
    ctx.fillRect(x + 4, y + 5, w / 2 - 6, h - 10);
    ctx.fillStyle = '#d89c42';
    ctx.fillRect(x + w / 2 + 2, y + 5, w / 2 - 6, h - 10);
    ctx.strokeStyle = '#3a2219';
    ctx.strokeRect(x, y, w, h);
  }

  /** @returns {void} */
  static drawDoor(ctx, x, y, size) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    this.wall(ctx, size, { leftWall: true, rightWall: true, aboveWall: true, belowWall: false }, 0, 0);
    ctx.fillStyle = '#7a4528';
    ctx.fillRect(size * .22, size * .24, size * .56, size * .76);
    ctx.fillStyle = '#a76538';
    ctx.fillRect(size * .29, size * .32, size * .16, size * .58);
    ctx.fillStyle = '#4b2a1d';
    ctx.fillRect(size * .55, size * .32, size * .16, size * .58);
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.arc(size * .69, size * .58, size * .045, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
