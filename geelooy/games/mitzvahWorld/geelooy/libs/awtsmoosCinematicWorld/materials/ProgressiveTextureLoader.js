// B"H
/** Worker-safe Chai bitmap loader: fetch bytes, decode bitmap, never touch DOM. */
const cache = new Map();
const byte = (v, f = 0) => Math.max(0, Math.min(255, Number.isFinite(Number(v)) ? Number(v) : f));

function makeFallbackCanvas(color) {
  if (typeof OffscreenCanvas === "undefined") return null;
  const c = new OffscreenCanvas(2, 2);
  const x = c.getContext("2d");
  if (!x) return null;
  x.fillStyle = `rgba(${byte(color[0])},${byte(color[1])},${byte(color[2])},${(byte(color[3],255)/255).toFixed(3)})`;
  x.fillRect(0, 0, 2, 2);
  return c;
}
function makeTexture(THREE, image, color) {
  if (image) { const tex = new THREE.Texture(image); tex.needsUpdate = true; tex.userData.awtsmoosBitmapBacked = true; return tex; }
  const data = new Uint8Array(color.map((v, i) => byte(v, i === 3 ? 255 : 0)));
  const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true; tex.userData.awtsmoosDataFallback = true; return tex;
}
function configure(THREE, tex, { srgb = true, repeat = null } = {}) {
  if (srgb && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(repeat.x || 1, repeat.y || 1); }
  tex.anisotropy = 4; return tex;
}
async function fetchBitmap(url) {
  if (typeof fetch !== "function" || typeof createImageBitmap !== "function") throw new Error("createImageBitmap unavailable");
  const res = await fetch(url, { mode:"cors", cache:"force-cache" });
  if (!res.ok) throw new Error(`texture fetch ${res.status}`);
  return createImageBitmap(await res.blob(), { imageOrientation:"none", premultiplyAlpha:"default", colorSpaceConversion:"default" });
}
function upgradeTexture(tex, bitmap) {
  if (!bitmap) return tex;
  tex.image = bitmap; tex.userData.loaded = true; tex.userData.awtsmoosFallback = false; tex.userData.imageBitmap = true; tex.needsUpdate = true; return tex;
}
export function loadProgressiveTexture(THREE, url, op = {}) {
  if (!THREE || !url) return null;
  const key = `${url}|${op.srgb !== false}|${JSON.stringify(op.repeat || null)}`;
  if (cache.has(key)) return cache.get(key);
  const fallback = op.fallback || [116, 168, 82, 255];
  const tex = configure(THREE, makeTexture(THREE, makeFallbackCanvas(fallback), fallback), op);
  Object.assign(tex.userData, { progressiveUrl:url, awtsmoosFallback:true, workerSafeBitmapLoader:true, noDocumentTextureLoad:true });
  cache.set(key, tex);
  fetchBitmap(url).then(bitmap => { upgradeTexture(tex, bitmap); op.onLoad?.(tex); })
    .catch(error => { tex.userData.error = String(error?.message || error || "bitmap texture error"); op.onError?.(tex); });
  return tex;
}
export function progressiveMaterialMap(THREE, material, url, options = {}) {
  const texture = loadProgressiveTexture(THREE, url, { ...options, onLoad: tex => { material.map = tex; material.needsUpdate = true; options.onLoad?.(tex); }, onError: tex => { material.needsUpdate = true; options.onError?.(tex); } });
  if (texture) { material.map = texture; material.needsUpdate = true; }
  Object.assign(material.userData ||= {}, { progressiveTextureUrl:url, loadsFastThenUpgrades:true, workerSafeBitmapLoader:true });
  return material;
}
export function progressiveCacheSnapshot() {
  return { size:cache.size, urls:[...cache.values()].map(t => ({ url:t.userData.progressiveUrl, loaded:!!t.userData.loaded, fallback:!!t.userData.awtsmoosFallback, bitmap:!!t.userData.imageBitmap, error:t.userData.error || null })) };
}
