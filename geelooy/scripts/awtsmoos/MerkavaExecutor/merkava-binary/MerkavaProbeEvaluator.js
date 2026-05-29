// B"H
const { compileJsToJson } = require('./MerkavaJsCompiler.js');
const { runJsonCode } = require('./MerkavaJsonRunner.js');

function cloneProbeValue(value) {
  if (value === undefined) return undefined;
  try { return JSON.parse(JSON.stringify(value)); } catch (_) { return String(value); }
}

function fallbackStructuredClone(value) { return JSON.parse(JSON.stringify(value)); }

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
    crypto: windowObj?.crypto || globalThis.crypto,
    structuredClone: windowObj?.structuredClone || globalThis.structuredClone || fallbackStructuredClone,
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
 * Probes ride the same Merkava chariot as page code. Expressions execute
 * against the live virtual window with browser globals present, so returned
 * values are concrete runtime evidence and failures include real errors.
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
