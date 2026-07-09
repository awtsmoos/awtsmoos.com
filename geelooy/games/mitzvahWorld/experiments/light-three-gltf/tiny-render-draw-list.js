// B"H
import { helperKind, isSurfaceMode, shouldRenderMode } from './tiny-render-policy.js';

/** Draw-list sorting: first surfaces, then transparent breath, helpers only by choice. */
export function collectMeshes(root, options = {}) {
  const opaque = [];
  const transparent = [];
  const hidden = { line: 0, point: 0, other: 0 };

  root.traverse((object) => {
    if (!object.isMesh || !object.visible) return;

    const mode = object.geometry?.mode ?? object.primitiveMode ?? 4;

    if (!shouldRenderMode(mode, options)) {
      const kind = helperKind(mode);
      hidden[kind] = (hidden[kind] || 0) + 1;
      return;
    }

    if (isTransparent(object)) transparent.push(object);
    else opaque.push(object);
  });

  return { opaque, transparent, hidden };
}

export function isTransparent(mesh) {
  const material = mesh.material;
  return material?.transparent === true ||
    material?.alphaMode === 'BLEND' ||
    (material?.opacity ?? 1) < 1;
}

export function isLitMode(mode) {
  return isSurfaceMode(mode ?? 4);
}

export function pointSizeForMode(mode) {
  return (mode ?? 4) === 0 ? 1.0 : 1.0;
}

export function triangleCountForMode(mode, count) {
  if ((mode ?? 4) === 4) return Math.floor(count / 3);
  if ((mode ?? 4) === 5 || (mode ?? 4) === 6) return Math.max(0, count - 2);
  return 0;
}
