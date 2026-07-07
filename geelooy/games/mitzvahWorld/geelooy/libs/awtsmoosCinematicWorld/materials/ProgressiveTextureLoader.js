// B"H
const cache = new Map();
export function loadProgressiveTexture(THREE, url, { srgb = true, repeat = null, onLoad = null } = {}) {
  if (!THREE || !url) return null;
  const key = `${url}|${srgb}|${JSON.stringify(repeat)}`;
  if (cache.has(key)) return cache.get(key);
  const loader = new THREE.TextureLoader(); loader.setCrossOrigin?.("anonymous");
  const tex = loader.load(url, t => { t.userData.loaded = true; onLoad?.(t); });
  if (srgb && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(repeat.x || 1, repeat.y || 1); }
  tex.anisotropy = 4; tex.userData.progressiveUrl = url; cache.set(key, tex); return tex;
}
export function progressiveMaterialMap(THREE, material, url, options = {}) {
  const texture = loadProgressiveTexture(THREE, url, { ...options, onLoad: () => { material.needsUpdate = true; options.onLoad?.(); } });
  if (texture) { material.map = texture; material.needsUpdate = true; }
  material.userData.progressiveTextureUrl = url; return material;
}
