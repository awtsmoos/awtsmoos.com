// B"H
const { compileJsToJson } = require('./MerkavaJsCompiler.js');
const { runJsonCode } = require('./MerkavaJsonRunner.js');

function cloneProbeValue(value) {
  if (value === undefined) return undefined;
  try { return JSON.parse(JSON.stringify(value)); } catch (_) { return String(value); }
}

function buildProbeGlobals(windowObj) {
  const document = windowObj?.document;
  return {
    window: windowObj,
    self: windowObj,
    document,
    console: windowObj?.console || console,
    location: windowObj?.location,
    navigator: windowObj?.navigator,
    URL: windowObj?.URL || URL,
    URLSearchParams: windowObj?.URLSearchParams || URLSearchParams,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    Promise,
    Map,
    Set
  };
}

/**
 * B"H
 * Chapter 106: probes also ride the chariot.
 *
 * Return values are JavaScript expressions, not dotted-property wishes. Each
 * requested expression is lowered into Merkava JSON and executed through SANG
 * against the live virtual window, so optional chains, calls, unary `!!`, and
 * method bindings are tested by the same runtime being diagnosed.
 */
async function evaluateMerkavaProbeExpressions({ windowObj, expressions = [] } = {}) {
  const values = {};
  const errors = {};
  for (const expression of expressions || []) {
    const key = String(expression);
    try {
      const source = `window.__merkavaProbeValue = (${key});`;
      const json = await compileJsToJson(source);
      const run = runJsonCode(json, { globals: buildProbeGlobals(windowObj) });
      if (!run.ok) {
        errors[key] = run.crash || { message: run.error || 'probe bytecode failed', trace: run.trace || [] };
        continue;
      }
      values[key] = cloneProbeValue(windowObj?.__merkavaProbeValue ?? run.globals?.window?.__merkavaProbeValue);
    } catch (error) {
      errors[key] = { message: error.message, stack: error.stack || '', code: error.code || null, trace: error.trace || null };
    } finally {
      if (windowObj && Object.prototype.hasOwnProperty.call(windowObj, '__merkavaProbeValue')) delete windowObj.__merkavaProbeValue;
    }
  }
  return { values, errors };
}

module.exports = { evaluateMerkavaProbeExpressions, cloneProbeValue };
