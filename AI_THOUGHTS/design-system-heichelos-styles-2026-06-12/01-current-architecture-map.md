B"H

# Current Architecture Map

The inspected project root is `C:/Users/Yackov Yitzchak/Documents/WoW/BH/awtsmoos.com`.
The current visual architecture has four confirmed pillars:

1. Shared style foundation under `geelooy/style/foundation`.
2. Home feed style domain under `geelooy/style/social/home` with compatibility wrappers at the old root level and decomposed modules under `core`, `beauty`, and `legend`.
3. Heichel shell style domain under `geelooy/style/heichelos/heichel`.
4. Reader/post style domain under `geelooy/heichelos/post/styles`.

Existing enforcement is already present in:

- `geelooy/style/test/cssQuality.test.js`
- `geelooy/style/test/cssImportGraph.test.mjs`
- `geelooy/style/test/cssSmallModuleBudget.test.mjs`
- `geelooy/style/test/jsCssStateContract.test.mjs`
- `geelooy/style/test/scrollVisualRegressionGuard.test.mjs`
- `geelooy/heichelos/post/styles/test/importedStyleOwnership.test.js`

The hidden architectural gap is that ownership is enforced mostly by tests and paths. The next revelation is explicit manifest ownership: domains, selectors, custom properties, state hooks, wrappers, and motion obligations become files that tests can inspect.
