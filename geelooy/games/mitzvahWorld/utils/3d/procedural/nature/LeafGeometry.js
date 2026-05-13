
/**
 * B"H
 * @file LeafGeometry.js
 * @description
 * Actual leaf-shaped geometry.
 */

/**
 * B"H
 * Creates a proper leaf shape geometry when ShapeGeometry exists.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} options
 * Leaf options.
 *
 * @returns {any}
 * Leaf geometry.
 */
export function createLeafGeometry(THREE, options) {
  if (
    THREE &&
    typeof THREE.Shape === "function" &&
    typeof THREE.ShapeGeometry === "function"
  ) {
    const half = options.width / 2;
    const len = options.length;

    const shape = new THREE.Shape();
    shape.moveTo(0, len * 0.5);
    shape.bezierCurveTo(half, len * 0.25, half, -len * 0.2, 0, -len * 0.5);
    shape.bezierCurveTo(-half, -len * 0.2, -half, len * 0.25, 0, len * 0.5);

    const geometry = new THREE.ShapeGeometry(shape, 8);
    geometry.name = "leaf-shaped-geometry";
    return geometry;
  }

  if (THREE && typeof THREE.PlaneGeometry === "function") {
    const geometry = new THREE.PlaneGeometry(options.width, options.length, 1, 3);
    geometry.name = "leaf-fallback-plane-geometry";
    return geometry;
  }

  throw new Error("No usable THREE leaf geometry constructor found");
}

/**
 * B"H
 * Creates a thin center vein.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} options
 * Leaf options.
 *
 * @returns {any|null}
 * Vein geometry or null.
 */
export function createLeafVeinGeometry(THREE, options) {
  if (!THREE || typeof THREE.BoxGeometry !== "function") return null;

  return new THREE.BoxGeometry(
    options.veinDepth,
    options.length * 0.82,
    options.veinDepth
  );
}
