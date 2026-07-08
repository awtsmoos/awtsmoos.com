// B"H
/**
 * @module GrassGenerator
 * @description
 * Chapter 440: the grass texture itself becomes grain, blade, seed, and dew.
 * This is not merely more meshes. The generated PNG now bakes layered blades,
 * stalk fibers, tan seed heads, clover specks, shadow clumps, and micro-noise.
 */
import Noise from "../Noise.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import CanvasHelper from "../CanvasHelper.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const TAU = Math.PI * 2;
const clamp = v => Math.max(0, Math.min(255, v | 0));
const mix = (a, b, t) => a + (b - a) * t;
const hash = (x, y, s = 1) => { const v = Math.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453; return v - Math.floor(v); };
function lineBlade(ctx, x, y, h, bend, color, width) { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + bend * .42, y - h * .55, x + bend, y - h); ctx.stroke(); }
function seed(ctx, x, y, s) { ctx.fillStyle = `rgba(218,204,111,${.35 + hash(x,y,9)*.45})`; ctx.beginPath(); ctx.ellipse(x, y, s * .65, s, hash(x,y,11)*TAU, 0, TAU); ctx.fill(); }
export default class GrassGenerator {
  static generate(width = 384, height = 384) {
    const canvas = CanvasHelper.create(width, height), ctx = canvas.getContext("2d"), imgData = ctx.createImageData(width, height), data = imgData.data, noise = new Noise();
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const u = x / width, v = y / height, broad = (noise.fractal(u * 6, v * 6, 4) + 1) / 2, fine = (noise.fractal(u * 55, v * 55, 3) + 1) / 2;
      const vertical = Math.pow(.5 + .5 * Math.sin(TAU * (u * 38 + Math.sin(v * TAU * 2) * .08)), 5);
      const clump = Math.pow(.5 + .5 * Math.sin(TAU * (u * 5.7 + v * 3.1 + broad)), 2.4);
      const t = Math.min(1, broad * .44 + fine * .22 + vertical * .28 + clump * .18);
      const dark = [25, 82, 31], mid = [53, 138, 54], light = [110, 190, 83], yellow = [160, 154, 72];
      const base = t > .72 ? light : t < .34 ? dark : mid, alt = hash(x, y, 5) > .965 ? yellow : base;
      const idx = (y * width + x) * 4;
      data[idx] = clamp(mix(dark[0], alt[0], t) + (hash(x,y,1)-.5)*18);
      data[idx+1] = clamp(mix(dark[1], alt[1], t) + (hash(x,y,2)-.5)*22);
      data[idx+2] = clamp(mix(dark[2], alt[2], t) + (hash(x,y,3)-.5)*12);
      data[idx+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < 1650; i++) { const x = hash(i,2)*width, y = hash(i,3)*height, h = 8 + hash(i,4)*34, bend = (hash(i,5)-.5)*16; lineBlade(ctx, x, y, h, bend, `rgba(${40+hash(i,6)*85},${110+hash(i,7)*100},${36+hash(i,8)*55},${.18+hash(i,9)*.32})`, .45 + hash(i,10)*1.15); if (i % 11 === 0) seed(ctx, x + bend, y - h, 1.4 + hash(i,12)*2.4); }
    for (let i = 0; i < 420; i++) { const x = hash(i,21)*width, y = hash(i,22)*height, r = 1.1 + hash(i,23)*2.8; ctx.fillStyle = hash(i,24) > .55 ? "rgba(222,236,160,.22)" : "rgba(38,92,32,.28)"; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    return canvas;
  }
}
