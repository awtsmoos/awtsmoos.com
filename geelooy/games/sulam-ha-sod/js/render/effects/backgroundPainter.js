// B"H
import { themeOf, themeSkin } from '../skin/worldTheme.js';
import { chain, cloud, crystal, poly, tree } from '../skin/shapePrayers.js';

/**
 * Five-layer chamber painter.
 *
 * Chapter 3: The Awtsmoos refused the false crown of glow. It lifted the blade
 * of simplicity and carved living places from rectangles, triangles, circles,
 * and lines. Sky, distance, middle, foreground, and gameplay atmosphere pass
 * over the canvas like five breaths, while collision remains untouched.
 */
export class BackgroundPainter {
  constructor() {
    this.seed = Array.from({ length: 80 }, (_, i) => ({ x: (i * 137) % 2200, y: 18 + ((i * 59) % 360), s: i % 5 === 0 ? 2 : 1 }));
  }

  /** @param {CanvasRenderingContext2D} c Context. @param {object} world World. @param {object} view View. @param {object} camera Camera. @param {number} frame Frame. */
  paint(c, world, view, camera, frame) {
    const theme = themeOf(world); const skin = themeSkin(theme);
    c.fillStyle = skin.sky; c.fillRect(0, 0, view.width, view.height);
    this[theme]?.(c, view, camera, frame, skin) || this.plains(c, view, camera, frame, skin);
  }

  fortress(c, view, camera, frame, skin) {
    this.ash(c, view, camera, frame, '#7a5a4f');
    this.towers(c, view, camera, skin.far, 0.03, 170);
    for (let x = -80; x < view.width + 140; x += 210) {
      const px = x - (camera.x * 0.09 % 210);
      c.fillStyle = skin.mid; c.fillRect(px, view.height - 190, 110, 190);
      poly(c, [[px, view.height - 190], [px + 55, view.height - 245], [px + 110, view.height - 190]], '#080507');
      chain(c, px + 140, 110, 10, 210, '#1b1515');
      c.fillStyle = '#5d1420'; c.fillRect(px + 28, view.height - 120, 44, 38);
    }
    c.fillStyle = skin.fore; c.fillRect(0, view.height - 72, view.width, 72);
    for (let x = 0; x < view.width; x += 46) c.fillRect(x, view.height - 92, 24, 20);
  }

  sky(c, view, camera, frame, skin) {
    for (let x = -140; x < view.width + 160; x += 230) cloud(c, x - (camera.x * 0.04 % 230), 75 + (x % 60), 18, '#ffe1c8');
    for (let x = -120; x < view.width + 180; x += 260) {
      const px = x - (camera.x * 0.07 % 260);
      c.fillStyle = skin.far; c.fillRect(px, view.height - 170, 105, 42);
      poly(c, [[px - 10, view.height - 170], [px + 52, view.height - 225], [px + 116, view.height - 170]], skin.mid);
      chain(c, px + 120, view.height - 155, 10, 110, skin.fore);
    }
    c.fillStyle = skin.fore;
    for (let x = -40; x < view.width + 70; x += 150) c.fillRect(x - (camera.x * 0.12 % 150), view.height - 92, 88, 18);
  }

  forest(c, view, camera, frame, skin) {
    for (let x = -80; x < view.width + 120; x += 90) tree(c, x - (camera.x * 0.04 % 90), view.height - 40, 230 + (x % 70), '#224126', '#2f7d49');
    for (let x = -70; x < view.width + 120; x += 72) tree(c, x - (camera.x * 0.10 % 72), view.height - 20, 170 + (x % 50), '#1d2f1b', '#1e5c33');
    c.strokeStyle = '#173319'; c.lineWidth = 3;
    for (let x = -20; x < view.width + 60; x += 75) { const px = x - (camera.x * 0.16 % 75); c.beginPath(); c.moveTo(px, 0); c.lineTo(px + 14, 145); c.stroke(); }
    this.leaves(c, view, camera, frame, '#b8dc68');
  }

  crystal(c, view, camera, frame, skin) {
    this.towers(c, view, camera, skin.far, 0.03, 220);
    for (let x = -60; x < view.width + 120; x += 120) {
      const px = x - (camera.x * 0.08 % 120);
      crystal(c, px, view.height - 205, 54, '#7d38d0');
      crystal(c, px + 38, view.height - 130, 34, '#d076ff');
      poly(c, [[px + 20, 0], [px + 43, 80], [px + 66, 0]], '#4b2180');
    }
    c.fillStyle = skin.fore; c.fillRect(0, view.height - 55, view.width, 55);
  }

  void(c, view, camera, frame, skin) {
    for (const s of this.seed) c.fillRect((s.x - camera.x * 0.025 + frame * 0.15) % view.width, s.y, s.s, s.s);
    c.strokeStyle = '#6a35b8'; c.lineWidth = 2;
    for (let i = 0; i < 7; i += 1) { const a = this.seed[i * 3], b = this.seed[i * 3 + 1]; c.beginPath(); c.moveTo(a.x % view.width, a.y); c.lineTo(b.x % view.width, b.y); c.stroke(); }
    for (let x = -90; x < view.width + 120; x += 180) {
      const px = x - (camera.x * 0.08 % 180); c.fillStyle = skin.mid;
      c.fillRect(px, view.height - 110 - (x % 70), 80, 20); c.fillRect(px + 22, view.height - 150 - (x % 70), 34, 34);
    }
  }

  plains(c, view, camera, frame, skin) {
    for (const s of this.seed.slice(0, 45)) c.fillRect((s.x - camera.x * 0.04) % view.width, s.y, s.s, s.s);
    this.towers(c, view, camera, skin.far, 0.05, 130);
  }

  towers(c, view, camera, color, rate, height) {
    c.fillStyle = color;
    for (let x = -80; x < view.width + 120; x += 100) c.fillRect(x - (camera.x * rate % 100), view.height - height - (x % 60), 82, height + (x % 60));
  }

  ash(c, view, camera, frame, color) {
    c.fillStyle = color;
    for (const s of this.seed.slice(0, 36)) c.fillRect((s.x - camera.x * 0.05) % view.width, (s.y + frame * (0.25 + s.s * 0.1)) % view.height, 1, 1);
  }

  leaves(c, view, camera, frame, color) {
    c.fillStyle = color;
    for (const s of this.seed.slice(0, 24)) c.fillRect((s.x - camera.x * 0.12 + frame * 0.35) % view.width, (s.y + frame * 0.18) % view.height, 3, 2);
  }
}
