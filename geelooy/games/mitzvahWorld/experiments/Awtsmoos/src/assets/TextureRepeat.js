// B"H
/**
 * TextureRepeat: the covenant of the pixel and the cubit.
 * The image stays original; the world only decides how many full tiles breathe across it.
 */
export function textureSize(image) {
  return { w: image?.naturalWidth || image?.videoWidth || image?.width || 1, h: image?.naturalHeight || image?.videoHeight || image?.height || 1 };
}
export function publicUrl(image) { return image?.dataset?.url || image?.dataset?.publicUrl || image?.src || null; }
export function exactRepeat(width, height, tileWorld = 1, min = 1, max = 256) {
  return [clamp(Math.round(Math.abs(width) / tileWorld), min, max), clamp(Math.round(Math.abs(height) / tileWorld), min, max)];
}
export function materialTexture(color, image, repeat, options = {}) {
  return { color, mapImage: image || null, textureUrl: publicUrl(image), mapRepeat: repeat, anisotropy: options.anisotropy ?? true, backfaceCull: !!options.backfaceCull, doubleSided: !!options.doubleSided, texturePolicy: { originalPixels: textureSize(image), repeat, tileWorld: options.tileWorld || null, fullResolution: true } };
}
export function wallRepeat(w, h) { return exactRepeat(w, h, .82, 1, 192); }
export function floorRepeat(w, d) { return exactRepeat(w, d, .92, 1, 192); }
export function roofRepeat(w, d) { return exactRepeat(w, d, 1.05, 1, 192); }
export function terrainRepeat(size) { return exactRepeat(size, size, 2.65, 32, 256); }
export function mixRepeat(size) { return exactRepeat(size, size, 8.5, 16, 96); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v || lo)); }
