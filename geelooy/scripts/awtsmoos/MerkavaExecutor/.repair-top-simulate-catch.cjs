// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/core/simulateRuntime.js';
let text = fs.readFileSync(file, 'utf8');
const oldText = `export async function simulateRuntime(options = {}) {
  const normalized = normalizeOptions(options);
  if (normalized.workflow) {
    const ctx = { ...normalized, options: normalized, result: null };
    const actions = createActionRegistry(runMerkavaAssemblerOnce);
    const workflowResult = await executeWorkflow(normalized.workflow, ctx, actions);
    return ctx.result || workflowResult || { ok: true, workflow: true, engine: "merkava" };
  }
  return runMerkavaAssemblerOnce(normalized);
}`;
const newText = `export async function simulateRuntime(options = {}) {
  try {
    const normalized = normalizeOptions(options);
    if (normalized.workflow) {
      const ctx = { ...normalized, options: normalized, result: null };
      const actions = createActionRegistry(runMerkavaAssemblerOnce);
      const workflowResult = await executeWorkflow(normalized.workflow, ctx, actions);
      return ctx.result || workflowResult || { ok: true, workflow: true, engine: "merkava" };
    }
    return await runMerkavaAssemblerOnce(normalized);
  } catch (error) {
    return {
      ok: false,
      engine: "merkava",
      browserRuntime: false,
      error: error.message,
      code: error.code || null,
      trace: error.trace || null,
      stack: error.stack || "",
      errors: [{ message: error.message, code: error.code || null, trace: error.trace || null, stack: error.stack || "" }],
      epochs: [{ id: 0, name: "simulateRuntime-public-catch", ok: false }]
    };
  }
}`;
if (!text.includes(oldText)) throw new Error('simulateRuntime export block not found');
text = text.replace(oldText, newText);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasPublicCatch: text.includes('simulateRuntime-public-catch') }, null, 2));
