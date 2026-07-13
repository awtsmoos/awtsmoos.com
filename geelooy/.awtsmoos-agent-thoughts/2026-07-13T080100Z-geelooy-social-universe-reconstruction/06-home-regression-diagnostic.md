# B"H

Boruch Hashem

Blessed is He

## Home Regression Diagnostic

MODULE_GRAPH_CODE=0

```text
B"H homeDashboardModuleGraph.test passed
(node:52835) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/home/dashboard/feedSafeLoader.js?module-graph-contract=1 is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
```

MOBILE_CONTRACT_CODE=1

```text
node:internal/modules/run_main:107
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: feed loader missing data-feed-renderer="unified-feed-card"
    at file:///Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/home/dashboard/mobileButtonsContract.test.mjs:7:144
    at ModuleJob.run (node:internal/modules/esm/module_job:439:25)
    at async node:internal/modules/esm/loader:633:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: false,
  expected: true,
  operator: '==',
  diff: 'simple'
}

Node.js v24.17.0
```
