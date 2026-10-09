// B"H — auto-generated browser shim for UMD CssConditionEvaluator.js
// The UMD original is loaded as a classic script first (populates globalThis.Merkava).
const pkg = {
  matchesMediaQuery: globalThis.Merkava.matchesMediaQuery,
  matchesSupportsCondition: globalThis.Merkava.matchesSupportsCondition,
};
for (const k of Object.keys(pkg)) if (pkg[k] === undefined) console.warn("[merkava] UMD export missing:", k);
export default pkg;
export const matchesMediaQuery = pkg.matchesMediaQuery;
export const matchesSupportsCondition = pkg.matchesSupportsCondition;
