// B"H
/**
 * @file RenderGeometrySanitizer.js
 * @description Removes render-only geometry hazards before Three.js compiles a program.
 */

const MAX_DRAW_COUNT = 100000000;

function materialList(material) {
  return Array.isArray(material) ? material.filter(Boolean) : material ? [material] : [];
}

function remember(root, record) {
  try {
    const scope = globalThis;
    scope.__AWTSMOOS_GEOMETRY_SANITIZER_TRACE__ ||= [];
    scope.__AWTSMOOS_GEOMETRY_SANITIZER_TRACE__.push({ ...record, at: Date.now() });
    scope.__AWTSMOOS_GEOMETRY_SANITIZER_TRACE__ = scope.__AWTSMOOS_GEOMETRY_SANITIZER_TRACE__.slice(-120);
    if (root && root.userData) root.userData.geometrySanitizerTrace = scope.__AWTSMOOS_GEOMETRY_SANITIZER_TRACE__;
  } catch {}
}

function finiteVector3(v) {
  return !v || (Number.isFinite(Number(v.x)) && Number.isFinite(Number(v.y)) && Number.isFinite(Number(v.z)));
}

function finiteMatrix(m) {
  return !m?.elements || m.elements.every(value => Number.isFinite(Number(value)));
}

function attrValid(attribute) {
  if (!attribute) return false;
  const count = Number(attribute.count);
  const itemSize = Number(attribute.itemSize || 0);
  const array = attribute.array;
  if (!Number.isFinite(count) || count <= 0) return false;
  if (!Number.isFinite(itemSize) || itemSize <= 0) return false;
  if (!array || typeof array.length !== "number") return false;
  if (!Number.isFinite(Number(array.length)) || array.length < count * itemSize) return false;
  return true;
}

function geometryReason(geometry) {
  if (!geometry || !geometry.attributes) return "missing-buffer-geometry";
  if (!attrValid(geometry.attributes.position)) return "missing-or-invalid-position";
  const posCount = Number(geometry.attributes.position.count);
  const draw = geometry.drawRange || {};
  const start = Number(draw.start || 0);
  const count = Number(draw.count);
  if (!Number.isFinite(start) || start < 0) return "invalid-draw-range-start";
  if (!Number.isFinite(count) || count < 0 || count > MAX_DRAW_COUNT) return "invalid-draw-range-count";
  if (count !== Infinity && count > posCount && !geometry.index) return "draw-range-exceeds-position-count";
  return "";
}

function nodeReason(node) {
  if (!node) return "missing-node";
  if (!finiteVector3(node.position) || !finiteVector3(node.scale) || !finiteVector3(node.rotation)) return "non-finite-transform";
  if (!finiteMatrix(node.matrix) || !finiteMatrix(node.matrixWorld)) return "non-finite-matrix";
  const mats = materialList(node.material);
  const isPointOrLine = node.isPoints || node.isLine || node.isLineSegments;
  const hasPointOrLineMaterial = mats.some(mat => mat?.isPointsMaterial || mat?.isLineBasicMaterial || /PointsMaterial|Line/i.test(String(mat?.type || "")));
  const pointNamedSkin = isPointOrLine && mats.some(mat => /skin/i.test(String(mat?.name || "")));
  const skinnedPointLayer = node.isPoints && (node.geometry?.attributes?.skinIndex || node.geometry?.attributes?.skinWeight);
  if (pointNamedSkin) return "points-material-skin-layer-disabled";
  if (skinnedPointLayer) return "points-with-skin-attributes-disabled";
  if (isPointOrLine || hasPointOrLineMaterial) return "unsupported-point-line-render-node";
  if (node.geometry) return geometryReason(node.geometry);
  return "";
}

function detach(node, root, reason) {
  remember(root, {
    name: node?.name || "(unnamed)",
    type: node?.type || null,
    material: materialList(node?.material).map(mat => mat?.name || mat?.type).filter(Boolean).join(",") || null,
    geometry: node?.geometry?.type || null,
    parent: node?.parent?.name || null,
    reason
  });
  try {
    node.visible = false;
    node.frustumCulled = true;
    Object.assign(node.userData ||= {}, {
      awtsmoosRenderSanitized: true,
      awtsmoosRenderSanitizedReason: reason,
      skipRaycast: true,
      skipOctree: true,
      noOctree: true
    });
    node.parent?.remove?.(node);
    node.geometry?.dispose?.();
    materialList(node.material).forEach(mat => mat?.dispose?.());
  } catch {}
}

export function sanitizeRenderGeometryTree(root, options = {}) {
  if (!root || typeof root.traverse !== "function") return { removed: 0, reasons: {} };
  const offenders = [];
  root.traverse(node => {
    if (!node || node === root) return;
    const reason = nodeReason(node);
    if (reason) offenders.push([node, reason]);
  });
  const stats = { removed: 0, reasons: {} };
  for (const [node, reason] of offenders) {
    detach(node, root, reason);
    stats.removed += 1;
    stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
  }
  if (stats.removed && options.warn !== false) {
    try { console.warn('B"H | RENDER_GEOMETRY_SANITIZED', stats); } catch {}
  }
  return stats;
}

export function isRenderableGeometrySafe(node) {
  return !nodeReason(node);
}

export default sanitizeRenderGeometryTree;
