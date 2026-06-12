// B"H
/**
 * @file runtime-dom-hydrator-canvas-regression.test.cjs
 * @description
 * Chapter 27: A canvas was born, then a comment-wave tried to erase it.
 * This regression stands forever at the gate: comments and later text must not
 * clear prior DOM children, and game modules must see canvas before startup.
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
const { VirtualDocument } = require(path.join(repoRoot, 'scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualDocument.js'));
const { hydrateHTML } = require(path.join(repoRoot, 'scripts/awtsmoos/MerkavaExecutor/merkava-runtime/DOMHydrator.js'));
const { buildRuntimeActions } = require(path.join(repoRoot, 'apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js'));

function assertHydratorKeepsCanvasAfterComment() {
  const doc = new VirtualDocument();
  const html = '<body><canvas id="gameCanvas"></canvas><!-- teaching screen --><div id="later">after</div></body>';
  const hydrated = hydrateHTML(doc, html);
  const canvas = doc.getElementById('gameCanvas');
  assert.equal(hydrated.ok, true);
  assert.ok(canvas, 'canvas disappeared after HTML comment hydration');
  assert.equal(canvas.tagName, 'CANVAS');
  assert.ok(canvas.getContext('2d'), 'canvas 2d context missing');
  assert.ok(doc.getElementById('later'), 'later sibling missing');
}

async function assertKavanahFindsCanvasAtRuntime() {
  const entry = 'geelooy/games/KAVANAH/index.html';
  const result = await buildRuntimeActions({
    payload: { p: entry, waitMs: 100, timeoutMs: 20000 },
    config: { root: appRoot }
  }).simulateRuntime();
  const messages = (result.errors || []).map(e => e.message || String(e));
  assert.ok(!messages.some(m => m.includes("getContext")), 'KAVANAH still loses gameCanvas: ' + messages.join(' | '));
  return { ok: result.ok, score: result.score, errors: messages.slice(0, 5) };
}

(async () => {
  assertHydratorKeepsCanvasAfterComment();
  const kavanah = await assertKavanahFindsCanvasAtRuntime();
  console.log(JSON.stringify({ ok: true, hydratorCanvasRegression: 'passed', kavanah }, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
