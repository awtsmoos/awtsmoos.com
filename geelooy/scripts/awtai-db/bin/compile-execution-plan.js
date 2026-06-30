#!/usr/bin/env node
// B"H
const { compileExecutionPlan } = require('../compile/execution-plan-compiler.js');

const model = process.argv[2];
if (!model) usage();

try {
  const result = compileExecutionPlan(model, { dir: process.argv[3] });
  console.log(JSON.stringify({ ok: true, artifact: result.artifact,
    bytes: result.bytes, cacheKey: result.plan.cacheKey,
    summary: result.plan.summary, budgets: result.plan.budgets,
    audit: result.plan.audit }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: String(error.stack || error) }, null, 2));
  process.exit(2);
}

function usage() {
  console.error('Usage: compile-execution-plan model.awtai-db [artifact-dir]');
  process.exit(1);
}
