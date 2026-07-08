// B"H
/**
 * @module FurGenerator
 * @description
 * Chapter 444: fur becomes a generated garment, not a flat color.
 * Fibers, streaks, spots, muzzle softness, and feather bands are baked into a
 * canvas texture that TextureForge can store in IndexedDB by species version.
 */
import CanvasHelper from "../CanvasHelper.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const TAU = Math.PI * 2;
const PALE = [238, 226, 199];
const PROFILES = Object.freeze({
  foxfur: { base: [192, 86, 32], dark: [72, 38, 22], light: [230, 139, 58], accent: PALE, stripes: .75, spots: 0, bands: 0 },
  rabbitfur: { base: [202, 188, 158], dark: [108, 97, 78], light: [238, 229, 203], accent: [226, 214, 188], stripes: .28, spots: .12, bands: 0 },
  deerfur: { base: [128, 82, 45], dark: [68, 41, 24], light: [185, 135, 82], accent: PALE, stripes: .22, spots: .78, bands: 0 },
  goatfur: { base: [188, 169, 132], dark: [94, 78, 56], light: [232, 218, 180], accent: [120, 104, 76], stripes: .48, spots: .08, bands: 0 },
  frogskin: { base: [71, 147, 62], dark: [31, 78, 38], light: [128, 190, 83], accent: [208, 220, 122], stripes: .08, spots: .55, bands: 0 },
  birdfeather: { base: [103, 136, 168], dark: [38, 52, 72], light: [170, 193, 210], accent: [232, 224, 154], stripes: .22, spots: .08, bands: .75 }
});
const hash = (x, y, s = 1) => { const v = Math.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453; return v - Math.floor(v); };
const clamp = v => Math.max(0, Math.min(255, v | 0));
const mix = (a, b, t) => a + (b - a) * t;
function profile(type) { return PROFILES[String(type || "rabbitfur").toLowerCase()] || PROFILES.rabbitfur; }
function fiber(ctx, x, y, len, bend, rgba, width) { ctx.strokeStyle = rgba; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + bend * .3, y - len * .25, x + bend * .7, y - len * .7, x + bend, y - len); ctx.stroke(); }
function drawOverlays(ctx, p, width, height) {
  for (let i = 0; i < 1800; i++) {
    const x = hash(i, 1) * width, y = hash(i, 2) * height, len = 6 + hash(i, 3) * 26, bend = (hash(i, 4) - .5) * 13;
    const light = hash(i, 5) > .55, c = light ? p.light : p.dark;
    fiber(ctx, x, y, len, bend, `rgba(${c[0]},${c[1]},${c[2]},${.13 + hash(i,6) * .22})`, .28 + hash(i, 7) * .8);
  }
  if (p.spots) for (let i = 0; i < 90; i++) { const x = hash(i, 11) * width, y = hash(i, 12) * height, r = 2 + hash(i, 13) * 7; ctx.fillStyle = `rgba(${p.accent[0]},${p.accent[1]},${p.accent[2]},${.18 + p.spots * .45})`; ctx.beginPath(); ctx.ellipse(x, y, r, r * (.65 + hash(i, 14) * .7), hash(i,15) * TAU, 0, TAU); ctx.fill(); }
}
export default class FurGenerator {
  static generate(type = "rabbitfur", width = 384, height = 384) {
    const p = profile(type), canvas = CanvasHelper.create(width, height), ctx = canvas.getContext("2d"), img = ctx.createImageData(width, height), data = img.data;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const u = x / width, v = y / height;
      const directional = Math.pow(.5 + .5 * Math.sin(TAU * (u * 18 + v * 3.2)), 3) * p.stripes;
      const band = Math.pow(.5 + .5 * Math.sin(TAU * (v * 8.5)), 8) * p.bands;
      const grain = hash(x, y, 3), soft = .5 + .5 * Math.sin(TAU * (u * 2.1 - v * 1.6));
      const t = Math.min(1, directional * .5 + band * .6 + soft * .18 + grain * .28);
      const idx = (y * width + x) * 4, base = t > .66 ? p.light : t < .28 ? p.dark : p.base;
      data[idx] = clamp(mix(p.dark[0], base[0], t) + (grain - .5) * 18);
      data[idx + 1] = clamp(mix(p.dark[1], base[1], t) + (hash(x,y,4) - .5) * 15);
      data[idx + 2] = clamp(mix(p.dark[2], base[2], t) + (hash(x,y,5) - .5) * 13);
      data[idx + 3] = 255;
    }
    ctx.putImageData(img, 0, 0); drawOverlays(ctx, p, width, height); return canvas;
  }
}
