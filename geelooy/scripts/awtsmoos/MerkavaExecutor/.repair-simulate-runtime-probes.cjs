// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/core/simulateRuntime.js';
let text = fs.readFileSync(file, 'utf8');
if (!text.includes('MerkavaProbeEvaluator.js')) {
  text = text.replace(
    'import { collectUrlFiles } from "./collectUrlFiles.js";\n',
    'import { collectUrlFiles } from "./collectUrlFiles.js";\nimport ProbeEvaluatorModule from "../../merkava-binary/MerkavaProbeEvaluator.js";\nconst { evaluateMerkavaProbeExpressions, cloneProbeValue } = ProbeEvaluatorModule;\n'
  );
}
const oldClone = `function cloneValue(value) {
  if (value === undefined) return undefined;
  try { return JSON.parse(JSON.stringify(value)); } catch (_) { return String(value); }
}`;
if (text.includes(oldClone)) text = text.replace(oldClone, `function cloneValue(value) { return cloneProbeValue(value); }`);
const oldExtract = `function extractRequestedValues(raw, runOptions = {}) {
  const runtime = raw?.runtime;
  const windowObj = runtime?.window || null;
  const nodeSnapshot = runtime?.snapshot ? runtime.snapshot() : null;
  const requested = Array.isArray(runOptions.returnValues) ? runOptions.returnValues : Array.isArray(runOptions.values) ? runOptions.values : [];
  const sources = { window: windowObj, globalThis, result: raw?.result?.result, snapshot: nodeSnapshot };
  const values = {};
  for (const key of requested) {
    const plain = String(key);
    values[plain] = cloneValue(readPath(sources, plain) ?? readPath(windowObj, plain) ?? readPath(raw?.result?.result, plain) ?? readPath(nodeSnapshot, plain));
  }
  const awtsmoosResult = cloneValue(windowObj?.__awtsmoosResult ?? raw?.result?.result?.__awtsmoosResult ?? globalThis.__awtsmoosResult);
  return { values, awtsmoosResult };
}`;
const newExtract = `async function extractRequestedValues(raw, runOptions = {}) {
  const runtime = raw?.runtime;
  const windowObj = runtime?.window || null;
  const nodeSnapshot = runtime?.snapshot ? runtime.snapshot() : null;
  const requested = Array.isArray(runOptions.returnValues) ? runOptions.returnValues : Array.isArray(runOptions.values) ? runOptions.values : [];
  const sources = { window: windowObj, globalThis, result: raw?.result?.result, snapshot: nodeSnapshot };
  const values = {};
  const expressionKeys = [];
  for (const key of requested) {
    const plain = String(key);
    const pathValue = readPath(sources, plain) ?? readPath(windowObj, plain) ?? readPath(raw?.result?.result, plain) ?? readPath(nodeSnapshot, plain);
    if (pathValue !== undefined && !/[()!?|&+\-*/%<>=]/.test(plain)) values[plain] = cloneValue(pathValue);
    else expressionKeys.push(plain);
  }
  const probe = expressionKeys.length ? await evaluateMerkavaProbeExpressions({ windowObj, expressions: expressionKeys }) : { values: {}, errors: {} };
  Object.assign(values, probe.values || {});
  const awtsmoosResult = cloneValue(windowObj?.__awtsmoosResult ?? raw?.result?.result?.__awtsmoosResult ?? globalThis.__awtsmoosResult);
  return { values, valueErrors: probe.errors || {}, awtsmoosResult };
}`;
if (!text.includes('valueErrors: probe.errors')) {
  if (!text.includes(oldExtract)) throw new Error('extractRequestedValues block not found');
  text = text.replace(oldExtract, newExtract);
}
text = text.replace('  const extracted = extractRequestedValues(raw, hydrated);', '  const extracted = await extractRequestedValues(raw, hydrated);');
if (!text.includes('result.valueErrors')) {
  text = text.replace('  result.values = extracted.values;\n', '  result.values = extracted.values;\n  result.valueErrors = extracted.valueErrors || {};\n');
}
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, imported: text.includes('MerkavaProbeEvaluator'), awaited: text.includes('await extractRequestedValues'), valueErrors: text.includes('result.valueErrors') }, null, 2));
