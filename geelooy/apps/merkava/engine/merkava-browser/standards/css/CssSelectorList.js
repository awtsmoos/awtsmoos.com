// B"H — auto-generated browser shim for UMD CssSelectorList.js
// The UMD original is loaded as a classic script first (populates globalThis.Merkava).
const pkg = {
  isCombinator: globalThis.Merkava.isCombinator,
  splitSelectorList: globalThis.Merkava.splitSelectorList,
  splitTopLevel: globalThis.Merkava.splitTopLevel,
  tokenizeSelectorSequence: globalThis.Merkava.tokenizeSelectorSequence,
};
for (const k of Object.keys(pkg)) if (pkg[k] === undefined) console.warn("[merkava] UMD export missing:", k);
export default pkg;
export const isCombinator = pkg.isCombinator;
export const splitSelectorList = pkg.splitSelectorList;
export const splitTopLevel = pkg.splitTopLevel;
export const tokenizeSelectorSequence = pkg.tokenizeSelectorSequence;
