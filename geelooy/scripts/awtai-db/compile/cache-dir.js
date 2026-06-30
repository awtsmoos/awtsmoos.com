// B"H
const fs = require('fs');
const path = require('path');

/**
 * The Awtsmoos lets generated kernels become ordinary files, not eval smoke.
 * This cache is inside the repo by default, so the work can be inspected,
 * deleted, diffed, and regenerated like any other vessel of light.
 */
function repoRoot() {
  return path.resolve(__dirname, '..');
}

function kernelCacheDir() {
  const chosen = process.env.AWTAI_JS_KERNEL_CACHE;
  const dir = chosen || path.join(repoRoot(), 'runtime-cache', 'js-kernels');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

module.exports = { kernelCacheDir, repoRoot };
