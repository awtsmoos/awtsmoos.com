// B"H
import { themeOf, themeSkin } from '../skin/worldTheme.js';
import { arch, banner, chain, cloud, crystal, poly, tree } from '../skin/shapePrayers.js';

/**
 * Five-layer hard-shape chamber painter.
 *
 * Chapter 12: The Awtsmoos refused empty rectangles and carved location from
 * disciplined primitives. Every chamber now owns a silhouette: fortress teeth,
 * prism symmetry, sanctuary water, womb-ruin arches. The loops allocate nothing
 * during draw; the old seed array is reused like eternal letters returning to
 * their source every frame.
 */
export class BackgroundPainter {
  constructor() {
    this.seed = Array.from({ length: 80 }, (_, i) => ({ x: (i * 137) % 2200, y: 18 + ((i * 59) % 360), s: i % 5 === 0 ? 2 : 1 }));
  }

  paint(c, world, view, camera, frame) {
    const theme = themeOf(world), skin = themeSkin(theme);
    c.fillStyle = skin.sky; c.fillRect(0, 0, view.width, view.height);
    const painter = this[theme] || this.plains; painter.call(this, c, view, camera, frame, skin);
  }

  gevurahFortress(c, view, camera, frame, skin) {
    this.embers(c, view, camera, frame, '#8a5045', 34);
    this.towers(c, view, camera, skin.far, 0.025, 230, 120);
    for (let x = -100; x < view.width + 160; x += 190) {
      const px = x - (camera.x * 0.08 % 190);
      c.fillStyle = skin.mid; c.fillRect(px, view.height - 220, 118, 220);
      poly(c, [[px, view.height - 220], [px + 59, view.height - 282], [px + 118, view.height - 220]], '#070405');
      for (let k = 0; k < 4; k += 1) c.fillRect(px + 12 + k * 26, view.height - 238, 14, 18);
      chain(c, px + 132, 90, 11, 230, '#181011'); banner(c, px + 32, view.height - 138, 44, 54, '#68151f', skin.trim);
    }
    this.crenelFloor(c, view, skin.fore, 86);
  }

  tiferesPrism(c, view, camera, frame, skin) {
    this.stars(c, view, camera, frame, '#ffe0a6', 38);
    this.towers(c, view, camera, skin.far, 0.025, 190, 150);
    const center = view.width / 2;
    for (let x = -160; x < view.width + 200; x += 180) {
      const px = x - (camera.x * 0.07 % 180), mirror = center + (center - px);
      crystal(c, px, view.height - 215, 60, skin.mid, skin.trim);
      crystal(c, mirror - 60, view.height - 215, 60, skin.mid, skin.trim);
      c.strokeStyle = skin.trim; c.lineWidth = 2; c.beginPath(); c.moveTo(px + 30, view.height - 215); c.lineTo(center, 90); c.lineTo(mirror - 30, view.height - 215); c.stroke();
    }
    c.fillStyle = skin.fore; c.fillRect(0, view.height - 58, view.width, 58);
    for (let x = 0; x < view.width; x += 72) poly(c, [[x, view.height - 58], [x + 36, view.height - 88], [x + 72, view.height - 58]], skin.body);
  }

  chesedSanctuary(c, view, camera, frame, skin) {
    c.fillStyle = '#5baed0'; c.fillRect(0, view.height - 82, view.width, 28);
    for (let x = -90; x < view.width + 130; x += 95) tree(c, x - (camera.x * 0.04 % 95), view.height - 45, 230 + (x % 70), '#28401f', '#54a85d');
    for (let x = -70; x < view.width + 120; x += 150) {
      const px = x - (camera.x * 0.10 % 150);
      c.fillStyle = skin.mid; c.fillRect(px, view.height - 116, 104, 18); c.fillRect(px + 16, view.height - 148, 72, 32);
      c.strokeStyle = skin.trim; c.lineWidth = 2; c.beginPath(); c.moveTo(px, view.height - 98); c.lineTo(px + 104, view.height - 98); c.stroke();
    }
    this.leaves(c, view, camera, frame, '#d4f080', 22);
  }

  binahWomb(c, view, camera, frame, skin) {
    this.stars(c, view, camera, frame, '#cfa6ff', 42);
    for (let x = -120; x < view.width + 160; x += 170) {
      const px = x - (camera.x * 0.06 % 170);
      arch(c, px, view.height - 210, 112, 180, skin.mid, skin.sky, skin.trim);
      arch(c, px + 54, view.height - 150, 82, 120, skin.fore, skin.sky, skin.trim);
      c.strokeStyle = skin.trim; c.lineWidth = 2; c.beginPath(); c.moveTo(px - 18, view.height - 86); c.lineTo(px + 138, view.height - 156); c.stroke();
    }
    c.fillStyle = '#09061c'; c.fillRect(0, view.height - 50, view.width, 50);
  }

  void(c, view, camera, frame, skin) {
    this.stars(c, view, camera, frame, '#bd6aff', 80);
    for (let x = -90; x < view.width + 120; x += 180) {
      const px = x - (camera.x * 0.08 % 180); c.fillStyle = skin.mid;
      c.fillRect(px, view.height - 110 - (x % 70), 80, 20); c.fillRect(px + 22, view.height - 150 - (x % 70), 34, 34);
    }
  }

  plains(c, view, camera, frame, skin) { this.stars(c, view, camera, frame, skin.trim, 45); this.towers(c, view, camera, skin.far, 0.05, 130, 100); }

  towers(c, view, camera, color, rate, height, step) {
    c.fillStyle = color;
    for (let x = -80; x < view.width + 120; x += step) c.fillRect(x - (camera.x * rate % step), view.height - height - (x % 60), step - 18, height + (x % 60));
  }

  crenelFloor(c, view, color, h) {
    c.fillStyle = color; c.fillRect(0, view.height - h, view.width, h);
    for (let x = 0; x < view.width; x += 46) c.fillRect(x, view.height - h - 20, 24, 20);
  }

  stars(c, view, camera, frame, color, count) {
    c.fillStyle = color;
    for (let i = 0; i < count; i += 1) { const s = this.seed[i]; c.fillRect((s.x - camera.x * 0.035 + frame * 0.06) % view.width, s.y, s.s, s.s); }
  }

  embers(c, view, camera, frame, color, count) {
    c.fillStyle = color;
    for (let i = 0; i < count; i += 1) { const s = this.seed[i]; c.fillRect((s.x - camera.x * 0.05) % view.width, (s.y + frame * (0.22 + s.s * 0.08)) % view.height, 1, 1); }
  }

  leaves(c, view, camera, frame, color, count) {
    c.fillStyle = color;
    for (let i = 0; i < count; i += 1) { const s = this.seed[i]; c.fillRect((s.x - camera.x * 0.12 + frame * 0.25) % view.width, (s.y + frame * 0.14) % view.height, 3, 2); }
  }
}
