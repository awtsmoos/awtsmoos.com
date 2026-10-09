// B"H — auto-generated browser shim for UMD CssTransform.js
// The UMD original is loaded as a classic script first (populates globalThis.Merkava).
const pkg = {
  angleToRad: globalThis.Merkava.angleToRad,
  applyMatrixToPoint: globalThis.Merkava.applyMatrixToPoint,
  computeTransformMatrix: globalThis.Merkava.computeTransformMatrix,
  functionToMatrix: globalThis.Merkava.functionToMatrix,
  identityMatrix: globalThis.Merkava.identityMatrix,
  lengthToPx: globalThis.Merkava.lengthToPx,
  matrixToCss: globalThis.Merkava.matrixToCss,
  multiplyMatrix: globalThis.Merkava.multiplyMatrix,
  parseTransform: globalThis.Merkava.parseTransform,
  parseTransformOrigin: globalThis.Merkava.parseTransformOrigin,
  transformRect: globalThis.Merkava.transformRect,
};
for (const k of Object.keys(pkg)) if (pkg[k] === undefined) console.warn("[merkava] UMD export missing:", k);
export default pkg;
export const angleToRad = pkg.angleToRad;
export const applyMatrixToPoint = pkg.applyMatrixToPoint;
export const computeTransformMatrix = pkg.computeTransformMatrix;
export const functionToMatrix = pkg.functionToMatrix;
export const identityMatrix = pkg.identityMatrix;
export const lengthToPx = pkg.lengthToPx;
export const matrixToCss = pkg.matrixToCss;
export const multiplyMatrix = pkg.multiplyMatrix;
export const parseTransform = pkg.parseTransform;
export const parseTransformOrigin = pkg.parseTransformOrigin;
export const transformRect = pkg.transformRect;
