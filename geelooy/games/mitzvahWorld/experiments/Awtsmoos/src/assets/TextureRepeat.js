// B"H
/**
 * TextureRepeat: one mesh, one draw call, original pixels, sane visual scale.
 * Repeating is shader coordinate breath; it must not become pixel-noise dust.
 */
export function textureSize(image) {
  return { w: image?.naturalWidth || image?.videoWidth || image?.width || 1, h: image?.naturalHeight || image?.videoHeight || image?.height || 1 };
}
export function publicUrl(image) { return image?.dataset?.url || image?.dataset?.publicUrl || image?.src || null; }
export function exactRepeat(width, height, tileWorld = 1, min = 1, max = 128) {
  return [clamp(Math.round(Math.abs(width) / tileWorld), min, max), clamp(Math.round(Math.abs(height) / tileWorld), min, max)];
}
export function materialTexture(color, image, repeat, options = {}) {
  return { color, mapImage: image || null, textureUrl: publicUrl(image), mapRepeat: repeat, anisotropy: options.anisotropy ?? true, backfaceCull: !!options.backfaceCull, doubleSided: !!options.doubleSided, texturePolicy: { originalPixels: textureSize(image), repeat, tileWorld: options.tileWorld || null, shaderWrap: true, fullResolution: true, oneDrawCall: true } };
}
export function wallRepeat(w, h) { return exactRepeat(w, h, 13.0, 1, 8); }
export function floorRepeat(w, d) { return exactRepeat(w, d, 5.0, 1, 24); }
export function roofRepeat(w, d) { return exactRepeat(w, d, 11.0, 1, 12); }
export function terrainRepeat(size) { return exactRepeat(size, size, 30.0, 8, 24); }
export function mixRepeat(size) { return exactRepeat(size, size, 60.0, 3, 12); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v || lo)); }
