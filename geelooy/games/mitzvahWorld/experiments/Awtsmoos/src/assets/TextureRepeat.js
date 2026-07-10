// B"H
/** TextureRepeat: one place decides exact visual scale; renderers stay one draw call. */
export const REPEAT_HOOKS = Object.freeze({
  terrainPixelsPerWorld: 675,
  dirtPixelsPerWorld: 620,
  wallPanelWorld: 9.5,
  floorPanelWorld: 4.2,
  roofPanelWorld: 7.2,
  roadPanelWorld: 3.8
});

export function textureSize(image) {
  return {
    w: image?.naturalWidth || image?.videoWidth || image?.width || 1254,
    h: image?.naturalHeight || image?.videoHeight || image?.height || 1254
  };
}

export function publicUrl(image) {
  return image?.dataset?.url || image?.dataset?.publicUrl || image?.src || null;
}

export function exactRepeat(width, height, tileWorld = 1, min = 1, max = 128) {
  return [
    clamp(Math.round(Math.abs(width) / tileWorld), min, max),
    clamp(Math.round(Math.abs(height) / tileWorld), min, max)
  ];
}

export function repeatFromPixels(width, height, image, pixelsPerWorld, min = 1, max = 720) {
  const s = textureSize(image);
  return [
    clamp(Math.round(Math.abs(width) * pixelsPerWorld / s.w), min, max),
    clamp(Math.round(Math.abs(height) * pixelsPerWorld / s.h), min, max)
  ];
}

export function materialTexture(color, image, repeat, options = {}) {
  return {
    color,
    mapImage: image || null,
    textureUrl: publicUrl(image),
    mapRepeat: repeat,
    anisotropy: options.anisotropy ?? 4,
    backfaceCull: !!options.backfaceCull,
    doubleSided: !!options.doubleSided,
    texturePolicy: policy(image, repeat, options)
  };
}

export function wallRepeat(w, h) {
  return exactRepeat(w, h, REPEAT_HOOKS.wallPanelWorld, 1, 12);
}

export function floorRepeat(w, d) {
  return exactRepeat(w, d, REPEAT_HOOKS.floorPanelWorld, 1, 28);
}

export function roofRepeat(w, d) {
  return exactRepeat(w, d, REPEAT_HOOKS.roofPanelWorld, 2, 20);
}

export function roadRepeat(width, length) {
  return [
    clamp(Math.round(Math.abs(width) / REPEAT_HOOKS.roadPanelWorld), 1, 3),
    clamp(Math.round(Math.abs(length) / REPEAT_HOOKS.roadPanelWorld), 1, 92)
  ];
}

export function terrainRepeat(size, image) {
  return repeatFromPixels(size, size, image, REPEAT_HOOKS.terrainPixelsPerWorld, 280, 310);
}

export function mixRepeat(size, image) {
  return repeatFromPixels(size, size, image, REPEAT_HOOKS.dirtPixelsPerWorld, 215, 295);
}

function policy(image, repeat, options) {
  return {
    originalPixels: textureSize(image),
    repeat,
    tileWorld: options.tileWorld || null,
    shaderWrap: 'mirror-pingpong-repeat',
    fullResolution: true,
    oneDrawCall: true,
    hook: options.hook || null
  };
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v || lo));
}
