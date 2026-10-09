// B"H
/**
 * @file imageLoader.js
 * @description
 * Unified image loading for the Merkava browser: format detection by magic
 * bytes, dispatch to the from-scratch decoders (PNG/JPEG/WebP/GIF), fast
 * blitting onto the software framebuffer, and an LRU cache keyed by URL.
 *
 * Network fetching is NOT done here — the caller (page loader / DirectNet)
 * supplies raw bytes. JS execution stays in the Merkava VM; this module only
 * decodes pixels.
 */
import { decodePng } from './pngDecoder.js';
import { decodeGif } from './gifDecoder.js';

// B"H: JPEG/WebP decoders load lazily so a missing or broken decoder can
// never take down PNG/GIF. Each entry is () => Promise<decodeFn>.
const LAZY = {
  jpeg: () => import('./jpegDecoder.js').then(m => m.decodeJpeg),
  webp: () => import('./webpDecoder.js').then(m => m.decodeWebp),
};
const SYNC = { png: decodePng, gif: null }; // gif handled via frames below
const lazyCache = {};

// --- Magic-byte signatures -----------------------------------------------
const SIG = {
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  jpeg: [0xff, 0xd8, 0xff],
  gif87: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
  gif89: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  webpRiff: [0x52, 0x49, 0x46, 0x46], // + 'WEBP' at offset 8
  webpMark: [0x57, 0x45, 0x42, 0x50],
};

function matchAt(b, off, sig) {
  if (b.length < off + sig.length) return false;
  for (let i = 0; i < sig.length; i++) if (b[off + i] !== sig[i]) return false;
  return true;
}

/** Detect image format from magic bytes. Returns 'png'|'jpeg'|'gif'|'webp'|null. */
export function detectFormat(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (matchAt(b, 0, SIG.png)) return 'png';
  if (matchAt(b, 0, SIG.jpeg)) return 'jpeg';
  if (matchAt(b, 0, SIG.gif87) || matchAt(b, 0, SIG.gif89)) return 'gif';
  if (matchAt(b, 0, SIG.webpRiff) && matchAt(b, 8, SIG.webpMark)) return 'webp';
  return null;
}

/**
 * Decode image bytes to RGBA (async — JPEG/WebP decoders load on demand).
 * @returns {Promise<{width:number,height:number,data:Uint8ClampedArray,format:string}>}
 * For animated GIF, returns the first frame; use decodeImageFrames for all.
 */
export async function decodeImage(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const fmt = detectFormat(b);
  if (!fmt) throw new Error('imageLoader: unknown image format');
  switch (fmt) {
    case 'png': return decodePng(b);
    case 'gif': {
      const g = decodeGif(b);
      const f0 = g.frames[0];
      return { width: g.width, height: g.height, data: f0.data, format: 'gif' };
    }
    case 'jpeg':
    case 'webp': {
      if (!lazyCache[fmt]) lazyCache[fmt] = LAZY[fmt]();
      const dec = await lazyCache[fmt];
      return dec(b);
    }
  }
}

/**
 * Decode image bytes synchronously — PNG and GIF only.
 * (JPEG/WebP decoders are loaded lazily; use decodeImage for those.)
 */
export function decodeImageSync(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const fmt = detectFormat(b);
  if (fmt === 'png') return decodePng(b);
  if (fmt === 'gif') {
    const g = decodeGif(b);
    const f0 = g.frames[0];
    return { width: g.width, height: g.height, data: f0.data, format: 'gif' };
  }
  throw new Error('imageLoader: decodeImageSync supports png/gif only; use decodeImage for ' + fmt);
}

/**
 * Decode all frames (GIF animation; other formats return a single frame).
 * @returns {Promise<{width:number,height:number,format:string,frames:Array<{data:Uint8ClampedArray,delayMs:number}>}>}
 */
export async function decodeImageFrames(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const fmt = detectFormat(b);
  if (!fmt) throw new Error('imageLoader: unknown image format');
  if (fmt === 'gif') {
    const g = decodeGif(b);
    return { width: g.width, height: g.height, format: 'gif', loopCount: g.loopCount, frames: g.frames };
  }
  const one = await decodeImage(b);
  return { width: one.width, height: one.height, format: fmt, loopCount: 0, frames: [{ data: one.data, delayMs: 0 }] };
}

// --- Blitting ------------------------------------------------------------
/**
 * Composite a decoded RGBA image onto a Framebuffer.
 * Direct fb.data writes with manual source-over blending; optional scaling.
 *
 * @param {object} fb - Framebuffer (has .data Uint8ClampedArray, .width, .height)
 * @param {{width,height,data}} img - decoded image
 * @param {number} dx, dy - destination top-left
 * @param {number} [dw, dh] - destination size (defaults to natural size)
 * @param {object} [opts] - { smoothing: 'nearest'|'bilinear' } (default 'bilinear' when scaling)
 */
export function blitImage(fb, img, dx, dy, dw, dh, opts = {}) {
  const sw = img.width, sh = img.height;
  dw = dw === undefined ? sw : dw;
  dh = dh === undefined ? sh : dh;
  if (dw <= 0 || dh <= 0 || sw <= 0 || sh <= 0) return;
  const smoothing = opts.smoothing || (dw === sw && dh === sh ? 'nearest' : 'bilinear');

  const dst = fb.data, DW = fb.width, DH = fb.height;
  const src = img.data;

  // Clip destination rect to framebuffer.
  const x0 = Math.max(0, Math.floor(dx)), y0 = Math.max(0, Math.floor(dy));
  const x1 = Math.min(DW, Math.ceil(dx + dw)), y1 = Math.min(DH, Math.ceil(dy + dh));
  if (x1 <= x0 || y1 <= y0) return;

  if (smoothing === 'nearest' && dw === sw && dh === sh) {
    // Fast path: 1:1 copy with alpha blend.
    const ox = x0 - Math.floor(dx), oy = y0 - Math.floor(dy);
    for (let y = y0; y < y1; y++) {
      const sy = oy + (y - y0);
      if (sy < 0 || sy >= sh) continue;
      const sRow = sy * sw * 4, dRow = y * DW * 4;
      for (let x = x0; x < x1; x++) {
        const sx = ox + (x - x0);
        if (sx < 0 || sx >= sw) continue;
        const si = sRow + sx * 4, di = dRow + x * 4;
        const a = src[si + 3] / 255;
        if (a >= 1) {
          dst[di] = src[si]; dst[di + 1] = src[si + 1]; dst[di + 2] = src[si + 2]; dst[di + 3] = 255;
        } else if (a > 0) {
          const ia = 1 - a;
          dst[di] = Math.round(src[si] * a + dst[di] * ia);
          dst[di + 1] = Math.round(src[si + 1] * a + dst[di + 1] * ia);
          dst[di + 2] = Math.round(src[si + 2] * a + dst[di + 2] * ia);
          dst[di + 3] = 255;
        }
      }
    }
    return;
  }

  // Scaled path: bilinear (or nearest) sample + source-over.
  const xRatio = sw / dw, yRatio = sh / dh;
  const nearest = smoothing === 'nearest';
  for (let y = y0; y < y1; y++) {
    const syf = (y - dy) * yRatio;
    const dRow = y * DW * 4;
    for (let x = x0; x < x1; x++) {
      const sxf = (x - dx) * xRatio;
      let r, g, bl, a;
      if (nearest) {
        const sx = Math.min(sw - 1, Math.max(0, Math.floor(sxf)));
        const sy = Math.min(sh - 1, Math.max(0, Math.floor(syf)));
        const si = (sy * sw + sx) * 4;
        r = src[si]; g = src[si + 1]; bl = src[si + 2]; a = src[si + 3];
      } else {
        const x2 = Math.min(sw - 1, Math.max(0, Math.floor(sxf)));
        const y2 = Math.min(sh - 1, Math.max(0, Math.floor(syf)));
        const x3 = Math.min(sw - 1, x2 + 1), y3 = Math.min(sh - 1, y2 + 1);
        const fx = Math.min(1, Math.max(0, sxf - x2)), fy = Math.min(1, Math.max(0, syf - y2));
        const i00 = (y2 * sw + x2) * 4, i10 = (y2 * sw + x3) * 4;
        const i01 = (y3 * sw + x2) * 4, i11 = (y3 * sw + x3) * 4;
        const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
        r = src[i00] * w00 + src[i10] * w10 + src[i01] * w01 + src[i11] * w11;
        g = src[i00 + 1] * w00 + src[i10 + 1] * w10 + src[i01 + 1] * w01 + src[i11 + 1] * w11;
        bl = src[i00 + 2] * w00 + src[i10 + 2] * w10 + src[i01 + 2] * w01 + src[i11 + 2] * w11;
        a = src[i00 + 3] * w00 + src[i10 + 3] * w10 + src[i01 + 3] * w01 + src[i11 + 3] * w11;
      }
      const di = dRow + x * 4;
      const al = a / 255;
      if (al >= 1) {
        dst[di] = Math.round(r); dst[di + 1] = Math.round(g); dst[di + 2] = Math.round(bl); dst[di + 3] = 255;
      } else if (al > 0) {
        const ia = 1 - al;
        dst[di] = Math.round(r * al + dst[di] * ia);
        dst[di + 1] = Math.round(g * al + dst[di + 1] * ia);
        dst[di + 2] = Math.round(bl * al + dst[di + 2] * ia);
        dst[di + 3] = 255;
      }
    }
  }
}

// --- Canvas drawImage wiring ---------------------------------------------
// B"H: decoded images become paintable canvas textures via this registry.
// Usage (page loader / VM Image()):
//   const img = await decodeImage(bytes);
//   const tex = registerDecodedImageTexture(img);
//   imageEl.__decodedImageTexture = tex;   // drawImage() picks up tex.id
//   canvasEl.textures.push(tex);            // painter finds it in allTextures
let nextDecodedTexId = 1;
/** Wrap a decoded {width,height,data} image as a painter-ready texture. */
export function registerDecodedImageTexture(decoded) {
  return {
    id: 'decoded-img-' + (nextDecodedTexId++),
    kind: 'decoded-image',
    imageData: decoded,
    width: decoded.width,
    height: decoded.height,
  };
}

// --- LRU cache -----------------------------------------------------------
/** Tiny LRU cache for decoded images, keyed by URL string. */
export class ImageCache {
  constructor(maxEntries = 64, maxBytes = 64 * 1024 * 1024) {
    this.maxEntries = maxEntries;
    this.maxBytes = maxBytes;
    this.map = new Map(); // insertion-ordered; refresh on get
    this.bytes = 0;
  }
  _sizeOf(img) { return (img.data ? img.data.byteLength : 0) + 64; }
  get(key) {
    const e = this.map.get(key);
    if (!e) return undefined;
    this.map.delete(key); this.map.set(key, e); // refresh LRU
    return e.img;
  }
  set(key, img) {
    const size = this._sizeOf(img);
    if (this.map.has(key)) { this.bytes -= this._sizeOf(this.map.get(key).img); this.map.delete(key); }
    this.map.set(key, { img, size });
    this.bytes += size;
    while ((this.map.size > this.maxEntries || this.bytes > this.maxBytes) && this.map.size > 0) {
      const oldest = this.map.keys().next().value;
      this.bytes -= this.map.get(oldest).size;
      this.map.delete(oldest);
    }
  }
  clear() { this.map.clear(); this.bytes = 0; }
  get size() { return this.map.size; }
}

/**
 * Convenience: decode bytes and cache under a key (async).
 * @returns {Promise<decoded image {width,height,data,format}>}
 */
export async function decodeAndCache(cache, key, bytes) {
  const hit = cache.get(key);
  if (hit) return hit;
  const img = await decodeImage(bytes);
  cache.set(key, img);
  return img;
}
