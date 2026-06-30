#!/usr/bin/env node
// B"H
const { compileModelPlan } = require('../compile/model-plan-compiler.js');

const model = process.argv[2];
if (!model) {
  console.error('Usage: compile-model-plan model.awtai-db [artifact-dir]');
  process.exit(1);
}

try {
  const result = compileModelPlan(model, { dir: process.argv[3] });
  console.log(JSON.stringify({
    ok: true,
    artifact: result.artifact,
    bytes: result.bytes,
    cacheKey: result.plan.cacheKey,
    tensors: result.plan.tensors.length,
    layers: result.plan.config.layers,
    externalCompilerInvoked: false
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: String(error.stack || error) }, null, 2));
  process.exit(2);
}
