// B"H — auto-generated browser shim for UMD CssTransition.js
// The UMD original is loaded as a classic script first (populates globalThis.Merkava).
const pkg = {
  createTransition: globalThis.Merkava.createTransition,
  interpolateValue: globalThis.Merkava.interpolateValue,
  parseTime: globalThis.Merkava.parseTime,
  parseTimingFunction: globalThis.Merkava.parseTimingFunction,
  parseTransition: globalThis.Merkava.parseTransition,
  tickTransition: globalThis.Merkava.tickTransition,
  timingProgress: globalThis.Merkava.timingProgress,
  transitionForProperty: globalThis.Merkava.transitionForProperty,
};
for (const k of Object.keys(pkg)) if (pkg[k] === undefined) console.warn("[merkava] UMD export missing:", k);
export default pkg;
export const createTransition = pkg.createTransition;
export const interpolateValue = pkg.interpolateValue;
export const parseTime = pkg.parseTime;
export const parseTimingFunction = pkg.parseTimingFunction;
export const parseTransition = pkg.parseTransition;
export const tickTransition = pkg.tickTransition;
export const timingProgress = pkg.timingProgress;
export const transitionForProperty = pkg.transitionForProperty;
