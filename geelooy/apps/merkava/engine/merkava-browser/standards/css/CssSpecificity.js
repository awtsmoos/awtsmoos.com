// B"H — auto-generated browser shim for UMD CssSpecificity.js
// The UMD original is loaded as a classic script first (populates globalThis.Merkava).
const pkg = {
  compareSpecificity: globalThis.Merkava.compareSpecificity,
  cssSpecificity: globalThis.Merkava.cssSpecificity,
};
for (const k of Object.keys(pkg)) if (pkg[k] === undefined) console.warn("[merkava] UMD export missing:", k);
export default pkg;
export const compareSpecificity = pkg.compareSpecificity;
export const cssSpecificity = pkg.cssSpecificity;
