// B"H
/**
 * @module SafeGrass
 * @description
 * Chapter 441: the fast grass fallback is no longer plain.
 * Direct pixels still keep mobile quick, but the texture now includes blade
 * streaks, grain, straw specks, and deep clump shadows.
 */
import CanvasHelper from "../CanvasHelper.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const TAU = Math.PI * 2;
const clamp = v => Math.max(0, Math.min(255, v | 0));
const mix = (a, b, t) => a + (b - a) * t;
const hash = (x, y, s = 1) => { const v = Math.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453; return v - Math.floor(v); };
export default class SafeGrass {
  static generate(width = 384, height = 384) {
    try {
      const canvas = CanvasHelper.create(width, height), ctx = canvas.getContext("2d"), imgData = ctx.createImageData(width, height), data = imgData.data;
      const dark = [24, 88, 32], mid = [50, 136, 52], light = [111, 190, 81], straw = [170, 157, 82];
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        const u = x / width, v = y / height;
        const longWave = .5 + .5 * Math.sin(TAU * (u * 2.3 + v * 1.2));
        const bladeLine = Math.pow(.5 + .5 * Math.sin(TAU * (u * 42 + Math.sin(TAU * v * 3) * .12)), 5);
        const micro = hash(x, y, 4), clump = Math.pow(.5 + .5 * Math.cos(TAU * (u * 7.5 - v * 4.2)), 3);
        const shade = Math.min(1, longWave * .28 + bladeLine * .36 + clump * .22 + micro * .22);
        const base = shade < .46 ? dark : shade < .72 ? mid : light, top = micro > .975 ? straw : base, idx = (y * width + x) * 4;
        data[idx] = clamp(mix(dark[0], top[0], shade) + (micro - .5) * 20);
        data[idx + 1] = clamp(mix(dark[1], top[1], shade) + (hash(x,y,5) - .5) * 26);
        data[idx + 2] = clamp(mix(dark[2], top[2], shade) + (hash(x,y,6) - .5) * 14);
        data[idx + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < 950; i++) {
        const x = hash(i,1)*width, y = hash(i,2)*height, h = 7 + hash(i,3)*24, bend = (hash(i,4)-.5)*12;
        ctx.strokeStyle = `rgba(${38+hash(i,5)*75},${118+hash(i,6)*88},${38+hash(i,7)*44},${.16+hash(i,8)*.28})`;
        ctx.lineWidth = .4 + hash(i,9)*.9; ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x+bend*.45,y-h*.56,x+bend,y-h); ctx.stroke();
        if (i % 13 === 0) { ctx.fillStyle = "rgba(220,205,117,.34)"; ctx.fillRect(x + bend - 1, y - h - 1, 2 + hash(i,10)*2, 2 + hash(i,11)*2); }
      }
      return canvas;
    } catch (e) {
      console.error('B"H - SafeGrass bloom interrupted:', e);
      const emergency = CanvasHelper.create(64, 64), eCtx = emergency.getContext('2d'); eCtx.fillStyle = '#228B22'; eCtx.fillRect(0, 0, 64, 64); return emergency;
    }
  }
}
