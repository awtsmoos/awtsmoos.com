// B"H
/**
 * @file runtime-inline-module-import-regression.test.cjs
 * @description
 * Chapter 30: The inline module received a sibling name in the page's own
 * courtyard. Relative imports now walk from the HTML folder like Chrome, not
 * from the void where `import` would be mistaken for forbidden speech.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

function findPublicRoot(start) {
  let dir = start;
  while (dir && dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'apps/tunnel/agent/main.js'))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error('Could not locate geelooy public root from ' + start);
}

const repoRoot = findPublicRoot(__dirname);
const appRoot = path.dirname(repoRoot);
const { buildRuntimeActions } = require(path.join(repoRoot, 'apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js'));

async function main() {
  const files = {
    'world/index.html': '<body><div id="out"></div><script type="module">import { value } from "./spark.js"; document.getElementById("out").textContent = "INLINE:" + value;</script></body>',
    'world/spark.js': 'export const value = 770;'
  };
  const result = await buildRuntimeActions({
    payload: { runtime: 'browser', engine: 'merkava', entry: 'world/index.html', files, waitMs: 80, timeoutMs: 12000 },
    config: { root: appRoot }
  }).simulateRuntime();
  const text = JSON.stringify(result.domSnapshot || {});
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  assert.ok(text.includes('INLINE:770'), 'inline module relative import marker missing');
  console.log(JSON.stringify({ ok: true, inlineModuleRelativeImport: 'passed' }, null, 2));
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
