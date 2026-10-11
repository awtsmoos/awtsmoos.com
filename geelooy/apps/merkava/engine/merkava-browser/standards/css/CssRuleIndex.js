// B"H — auto-generated browser shim for UMD CssRuleIndex.js
// The UMD original is loaded as a classic script first (populates globalThis.Merkava).
const pkg = {
  buildCssRuleIndex: globalThis.Merkava.buildCssRuleIndex,
  cssRuleCandidates: globalThis.Merkava.cssRuleCandidates,
  matchesIndexedCssRule: globalThis.Merkava.matchesIndexedCssRule,
};
for (const k of Object.keys(pkg)) if (pkg[k] === undefined) console.warn("[merkava] UMD export missing:", k);
export default pkg;
export const buildCssRuleIndex = pkg.buildCssRuleIndex;
export const cssRuleCandidates = pkg.cssRuleCandidates;
export const matchesIndexedCssRule = pkg.matchesIndexedCssRule;
