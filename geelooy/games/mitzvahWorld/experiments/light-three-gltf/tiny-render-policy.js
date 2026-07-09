// B"H
/**
 * Render policy: GLTFLoader separates Mesh, Line, and Points objects.
 *
 * The normal chossid viewer wants the final character, not Blender helper
 * splines, point clouds, or auxiliary skin lines. Those modes remain available
 * as debug layers, but the default reader-like view shows surface primitives.
 */
export const PrimitiveMode = Object.freeze({
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6,
});

export function modeName(mode = PrimitiveMode.TRIANGLES) {
  return {
    0: 'POINTS',
    1: 'LINES',
    2: 'LINE_LOOP',
    3: 'LINE_STRIP',
    4: 'TRIANGLES',
    5: 'TRIANGLE_STRIP',
    6: 'TRIANGLE_FAN',
  }[mode] || `MODE_${mode}`;
}

export function isSurfaceMode(mode = PrimitiveMode.TRIANGLES) {
  return mode === PrimitiveMode.TRIANGLES ||
    mode === PrimitiveMode.TRIANGLE_STRIP ||
    mode === PrimitiveMode.TRIANGLE_FAN;
}

export function isLineMode(mode = PrimitiveMode.TRIANGLES) {
  return mode === PrimitiveMode.LINES ||
    mode === PrimitiveMode.LINE_LOOP ||
    mode === PrimitiveMode.LINE_STRIP;
}

export function shouldRenderMode(mode, options = {}) {
  if (isSurfaceMode(mode)) return options.showTriangles !== false;
  if (isLineMode(mode)) return options.showHelperLines === true;
  if (mode === PrimitiveMode.POINTS) return options.showHelperPoints === true;
  return false;
}

export function defaultRenderOptions() {
  return {
    showTriangles: true,
    showHelperLines: false,
    showHelperPoints: false,
    showSkeleton: false,
  };
}

export function helperKind(mode) {
  if (isLineMode(mode)) return 'line';
  if (mode === PrimitiveMode.POINTS) return 'point';
  return 'surface';
}
