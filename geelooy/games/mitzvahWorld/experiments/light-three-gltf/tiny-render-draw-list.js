// B"H
import { helperKind, isSurfaceMode, shouldRenderMode } from './tiny-render-policy.js';

/** Draw-list sorting: honors parent visibility, so hidden worlds and highlights truly vanish. */
export function collectMeshes(root, options = {}) {
  const opaque = [], transparent = [], hidden = { line: 0, point: 0, other: 0 };
  visit(root, true, object => {
    if (!object.isMesh) return;
    const mode = object.geometry?.mode ?? object.primitiveMode ?? 4;
    if (!shouldRenderMode(mode, options)) { const kind = helperKind(mode); hidden[kind] = (hidden[kind] || 0) + 1; return; }
    if (isTransparent(object)) transparent.push(object); else opaque.push(object);
  });
  return { opaque, transparent, hidden };
}
function visit(object, parentVisible, fn) {
  const visible = parentVisible && object.visible !== false;
  if (!visible) return;
  fn(object);
  for (const child of object.children || []) visit(child, visible, fn);
}
export function isTransparent(mesh) { const material = mesh.material; return material?.transparent === true || material?.alphaMode === 'BLEND' || (material?.opacity ?? 1) < 1; }
export function isLitMode(mode) { return isSurfaceMode(mode ?? 4); }
export function pointSizeForMode(mode) { return (mode ?? 4) === 0 ? 1.0 : 1.0; }
export function triangleCountForMode(mode, count) { if ((mode ?? 4) === 4) return Math.floor(count / 3); if ((mode ?? 4) === 5 || (mode ?? 4) === 6) return Math.max(0, count - 2); return 0; }
