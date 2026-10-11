// B"H
/** Self-tests for imageLoader.js: format detection, blit, cache. */
import { detectFormat, decodeImage, decodeImageSync, decodeImageFrames, blitImage, ImageCache, decodeAndCache } from './imageLoader.js';
import { readFileSync, readdirSync } from 'fs';

let passed = 0, failed = 0;
const pending = [];
function t(name, fn) {
  pending.push((async () => {
    try { await fn(); passed++; console.log('ok   -', name); }
    catch (e) { failed++; console.log('FAIL -', name + ':', e.message); }
  })());
}
function assert(c, m) { if (!c) throw new Error(m || 'assert'); }

// Minimal framebuffer stub matching the real Framebuffer's data layout.
function makeFb(w, h) {
  return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
}
function solidImg(w, h, r, g, b, a) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) { data[i*4]=r; data[i*4+1]=g; data[i*4+2]=b; data[i*4+3]=a; }
  return { width: w, height: h, data, format: 'test' };
}

t('detectFormat png', () => {
  const b = new Uint8Array(readFileSync('/tmp/imgtest/gray1bit.png'));
  assert(detectFormat(b) === 'png');
});
t('detectFormat jpeg', () => {
  const b = new Uint8Array(readFileSync('/tmp/imgtest/photo1.jpg'));
  assert(detectFormat(b) === 'jpeg');
});
t('detectFormat gif', () => {
  const b = new Uint8Array(readFileSync('/tmp/imgtest/earth.gif'));
  assert(detectFormat(b) === 'gif');
});
t('detectFormat webp', () => {
  const b = new Uint8Array(readFileSync('/tmp/imgtest/webp-1.webp'));
  assert(detectFormat(b) === 'webp');
});
t('detectFormat unknown -> null', () => {
  assert(detectFormat(new Uint8Array([1,2,3,4,5,6,7,8])) === null);
});
t('decodeImage png round-trip', async () => {
  const b = new Uint8Array(readFileSync('/tmp/imgtest/rgba-interlaced.png'));
  const img = await decodeImage(b);
  assert(img.width === 16 && img.height === 16 && img.format === 'png');
  assert(img.data instanceof Uint8ClampedArray && img.data.length === 16*16*4);
});
t('decodeImageSync png', () => {
  const b = new Uint8Array(readFileSync('/tmp/imgtest/gray1bit.png'));
  const img = decodeImageSync(b);
  assert(img.width === 8 && img.height === 8);
});
t('decodeImageSync rejects jpeg', () => {
  const b = new Uint8Array(readFileSync('/tmp/imgtest/photo1.jpg'));
  let threw = false;
  try { decodeImageSync(b); } catch { threw = true; }
  assert(threw);
});
t('decodeImage gif -> first frame', async () => {
  const b = new Uint8Array(readFileSync('/tmp/imgtest/earth.gif'));
  const img = await decodeImage(b);
  assert(img.width === 400 && img.height === 400 && img.format === 'gif');
});
t('decodeImageFrames gif -> all frames', async () => {
  const b = new Uint8Array(readFileSync('/tmp/imgtest/earth.gif'));
  const all = await decodeImageFrames(b);
  assert(all.frames.length > 1, 'expected multiple frames, got ' + all.frames.length);
});
t('decodeImage unknown throws', async () => {
  let threw = false;
  try { await decodeImage(new Uint8Array([9,9,9,9,9,9,9,9])); } catch { threw = true; }
  assert(threw);
});
t('blitImage 1:1 opaque', () => {
  const fb = makeFb(8, 8);
  blitImage(fb, solidImg(4, 4, 255, 0, 0, 255), 2, 2);
  const i = (3 * 8 + 3) * 4;
  assert(fb.data[i] === 255 && fb.data[i+1] === 0 && fb.data[i+2] === 0, 'red pixel');
  const j = (0 * 8 + 0) * 4;
  assert(fb.data[j] === 0 && fb.data[j+3] === 0, 'outside stays clear');
});
t('blitImage alpha blend', () => {
  const fb = makeFb(4, 4);
  fb.data.fill(255); // white background
  blitImage(fb, solidImg(4, 4, 255, 0, 0, 128), 0, 0);
  const i = 0;
  // 50% red over white -> ~ (255, 127, 127)
  assert(Math.abs(fb.data[i] - 255) < 2 && Math.abs(fb.data[i+1] - 127) < 3, 'blended: got ' + fb.data[i+1]);
});
t('blitImage scaled bilinear', () => {
  const fb = makeFb(8, 8);
  // 2x2: TL red, TR green, BL blue, BR white
  const data = new Uint8ClampedArray([255,0,0,255, 0,255,0,255, 0,0,255,255, 255,255,255,255]);
  blitImage(fb, { width: 2, height: 2, data, format: 't' }, 0, 0, 4, 4, { smoothing: 'bilinear' });
  // pixel (1,1) samples at (0.5, 0.5) -> average of all 4 corners ~ (127,127,127)
  const i = (1 * 8 + 1) * 4;
  assert(fb.data[i] > 90 && fb.data[i] < 170, 'bilinear center ~gray, got ' + fb.data[i]);
});
t('blitImage clips to framebuffer', () => {
  const fb = makeFb(4, 4);
  blitImage(fb, solidImg(8, 8, 0, 255, 0, 255), -2, -2); // partially offscreen
  const i = 0;
  assert(fb.data[i+1] === 255, 'clipped blit paints visible part');
});
t('ImageCache LRU eviction', () => {
  const c = new ImageCache(2, 1024 * 1024);
  c.set('a', solidImg(2, 2, 1, 1, 1, 255));
  c.set('b', solidImg(2, 2, 2, 2, 2, 255));
  c.set('c', solidImg(2, 2, 3, 3, 3, 255));
  assert(c.get('a') === undefined, 'oldest evicted');
  assert(c.get('c') !== undefined, 'newest kept');
  assert(c.size === 2);
});
t('decodeAndCache hits cache', async () => {
  const c = new ImageCache();
  const b = new Uint8Array(readFileSync('/tmp/imgtest/gray1bit.png'));
  const i1 = await decodeAndCache(c, 'k', b);
  const i2 = await decodeAndCache(c, 'k', b);
  assert(i1 === i2, 'same object from cache');
});

(async () => {
await Promise.all(pending);
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
})();
