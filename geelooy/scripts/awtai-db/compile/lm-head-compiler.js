// B"H
const fs = require('fs');
const path = require('path');
const { kernelCacheDir } = require('./cache-dir.js');
const { buildLmHeadPlan } = require('./lm-head-plan.js');
const { buildLmHeadSource } = require('./lm-head-source.js');

/**
 * Repo-owned JavaScript compilation: validate manifest reality, emit a normal
 * CommonJS file, then require it.  No C, no npm, no addon build, no eval.
 */
function ensureLmHeadKernel(ctx, tensor) {
  const plan = buildLmHeadPlan(ctx, tensor);
  if (!plan) return null;
  const file = path.join(kernelCacheDir(), `lm_head_${plan.key}.js`);
  if (mustRebuild() || !fs.existsSync(file)) writeKernel(file, plan);
  if (mustRebuild()) delete require.cache[require.resolve(file)];
  return require(file);
}

function compileLmHeadKernel(ctx, tensor) {
  const plan = buildLmHeadPlan(ctx, tensor);
  if (!plan) throw new Error("B'H only Q6_K LM-head compilation is implemented");
  const file = path.join(kernelCacheDir(), `lm_head_${plan.key}.js`);
  writeKernel(file, plan);
  return { file, plan };
}

function writeKernel(file, plan) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, buildLmHeadSource(plan));
  fs.renameSync(tmp, file);
}

function mustRebuild() {
  return /^(1|true|yes)$/.test(String(process.env.AWTAI_REBUILD_JS_KERNELS || '0'));
}

module.exports = { ensureLmHeadKernel, compileLmHeadKernel };
