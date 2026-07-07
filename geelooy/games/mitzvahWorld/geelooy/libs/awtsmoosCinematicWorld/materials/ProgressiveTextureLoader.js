// B"H
const cache = new Map();
function fallbackTexture(THREE, color = [106, 158, 76, 255]) {
  const data = new Uint8Array(color);
  const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true; tex.userData.awtsmoosFallback = true; return tex;
}
export function loadProgressiveTexture(THREE, url, { srgb = true, repeat = null, onLoad = null, onError = null, fallback = null } = {}) {
  if (!THREE || !url) return null;
  const key = `${url}|${srgb}|${JSON.stringify(repeat)}`;
  if (cache.has(key)) return cache.get(key);
  const tex = fallbackTexture(THREE, fallback || [116, 168, 82, 255]);
  if (srgb && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(repeat.x || 1, repeat.y || 1); }
  tex.anisotropy = 4; tex.userData.progressiveUrl = url; cache.set(key, tex);
  const loader = new THREE.TextureLoader(); loader.setCrossOrigin?.("anonymous");
  loader.load(url, loaded => {
    tex.image = loaded.image; tex.format = loaded.format; tex.type = loaded.type;
    tex.userData.loaded = true; tex.userData.awtsmoosFallback = false; tex.needsUpdate = true;
    onLoad?.(tex);
  }, undefined, error => { tex.userData.error = String(error?.message || error || "texture error"); onError?.(tex); });
  return tex;
}
export function progressiveMaterialMap(THREE, material, url, options = {}) {
  const texture = loadProgressiveTexture(THREE, url, { ...options, onLoad: () => { material.needsUpdate = true; options.onLoad?.(); }, onError: () => { material.needsUpdate = true; options.onError?.(); } });
  if (texture) { material.map = texture; material.needsUpdate = true; }
  material.userData.progressiveTextureUrl = url; material.userData.loadsFastThenUpgrades = true; return material;
}
export function progressiveCacheSnapshot() { return { size: cache.size, urls: [...cache.values()].map(t => ({ url: t.userData.progressiveUrl, loaded: !!t.userData.loaded, fallback: !!t.userData.awtsmoosFallback })) }; }
