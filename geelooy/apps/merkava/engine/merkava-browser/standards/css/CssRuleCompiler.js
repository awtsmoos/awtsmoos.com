// B"H — auto-generated browser shim for UMD CssRuleCompiler.js
// The UMD original is loaded as a classic script first (populates globalThis.Merkava).
const pkg = {
  compileCssStyleSheet: globalThis.Merkava.compileCssStyleSheet,
  declarationsFromObject: globalThis.Merkava.declarationsFromObject,
};
for (const k of Object.keys(pkg)) if (pkg[k] === undefined) console.warn("[merkava] UMD export missing:", k);
export default pkg;
export const compileCssStyleSheet = pkg.compileCssStyleSheet;
export const declarationsFromObject = pkg.declarationsFromObject;
