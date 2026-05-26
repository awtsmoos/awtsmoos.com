// B"H
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import RuntimeAssemblerModule from '../../merkava-runtime/RuntimeAssembler.js';
import { applyInteractions } from '../interactions/applyInteractions.js';

const require = createRequire(import.meta.url);
const merkava = require('../../merkava-binary/MerkavaBytecodeApi.js');
const { RuntimeAssembler } = RuntimeAssemblerModule;

function normalizeFiles(files = {}) {
  return merkava.normalizeFiles(files || {});
}

function elementSummary(element) {
  if (!element) return null;
  return {
    tagName: element.tagName || element.tag || '',
    id: element.id || '',
    className: element.className || '',
    textContent: element.textContent || '',
    attributes: element.attributes || {},
    children: Array.isArray(element.children)
      ? element.children.slice(0, 20).map(elementSummary)
      : []
  };
}

function slash(value) {
  return String(value || '').replace(/\\/g, '/');
}

function refsFrom(text, fromKey) {
  const refs = [];
  const base = path.dirname(fromKey);
  const add = spec => {
    if (!spec || /^[a-z]+:/i.test(spec)) return;
    refs.push(slash(path.join(base, spec)));
  };
  for (const m of String(text || '').matchAll(/(?:import|export)\s+[^"']*?["']([^"']+)["']/g)) add(m[1]);
  for (const m of String(text || '').matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)) add(m[1]);
  for (const m of String(text || '').matchAll(/<(?:script|link)[^>]+(?:src|href)=["']([^"']+)["']/g)) add(m[1]);
  return refs;
}

function collectFilesFromEntry(entry) {
  const absEntry = path.resolve(String(entry || ''));
  if (!absEntry || !fs.existsSync(absEntry) || !fs.statSync(absEntry).isFile()) return null;
  const root = path.dirname(absEntry);
  const files = {};
  const queue = [absEntry];
  while (queue.length && Object.keys(files).length < 80) {
    const abs = queue.shift();
    const rel = slash(path.relative(root, abs));
    if (files[rel] !== undefined) continue;
    const stat = fs.statSync(abs);
    if (stat.size > 512000) continue;
    const text = fs.readFileSync(abs, 'utf8');
    files[rel] = text;
    for (const ref of refsFrom(text, rel)) {
      const next = path.resolve(root, ref);
      if (next.startsWith(root) && fs.existsSync(next) && fs.statSync(next).isFile()) queue.push(next);
    }
  }
  return { entry: slash(path.relative(root, absEntry)), files, source: 'service-path-entry', root };
}

function resolveRuntimeInput(options = {}) {
  const explicit = normalizeFiles(options.files || {});
  if (Object.keys(explicit).length) return { entry: options.entry || 'index.html', files: explicit, source: 'explicit' };
  const collected = collectFilesFromEntry(options.entry);
  return collected || { entry: options.entry || 'index.html', files: explicit, source: 'empty' };
}

function scriptSources(files = {}) {
  const sources = [];
  for (const [name, source] of Object.entries(files || {})) {
    const text = String(source || '');
    if (name.endsWith('.js')) sources.push({ name, source: text });
    if (name.endsWith('.html')) {
      for (const match of text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
        if (match[1] && match[1].trim()) sources.push({ name: `${name}#inline`, source: match[1] });
      }
    }
  }
  return sources;
}

function readPath(root, key) {
  if (!root || !key) return undefined;
  return String(key).split('.').reduce((value, part) => value == null ? undefined : value[part], root);
}

function cloneValue(value) {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_) {
    return String(value);
  }
}

function extractRequestedValues(runtime, raw, options = {}) {
  const requested = Array.isArray(options.returnValues)
    ? options.returnValues
    : Array.isArray(options.values)
      ? options.values
      : [];
  const windowObj = runtime?.window || null;
  const snapshot = runtime?.snapshot ? runtime.snapshot() : null;
  const sources = {
    window: windowObj,
    globalThis,
    result: raw?.result?.result,
    snapshot
  };
  const values = {};
  for (const key of requested) {
    const plain = String(key);
    values[plain] = cloneValue(
      readPath(sources, plain) ??
      readPath(windowObj, plain) ??
      readPath(raw?.result?.result, plain) ??
      readPath(snapshot, plain)
    );
  }
  return {
    values,
    awtsmoosResult: cloneValue(
      windowObj?.__awtsmoosResult ??
      raw?.result?.result?.__awtsmoosResult ??
      globalThis.__awtsmoosResult
    )
  };
}

async function runObservableRuntime(input, options = {}) {
  const assembler = new RuntimeAssembler({
    ...options,
    files: input.files,
    entry: input.entry
  });
  const raw = await assembler.run(input.entry);
  let interactionLog = [];
  let interactionError = null;
  try {
    interactionLog = await applyInteractions(raw.runtime, options.interactions || []);
  } catch (error) {
    interactionError = { message: error.message, stack: error.stack || '' };
  }
  const snapshot = raw.runtime?.snapshot ? raw.runtime.snapshot() : null;
  const extracted = extractRequestedValues(raw.runtime, raw, options);
  return {
    raw,
    snapshot,
    domSnapshot: snapshot?.window?.document || null,
    console: snapshot?.window?.console || raw.console || null,
    interactionLog,
    interactionError,
    values: extracted.values,
    awtsmoosResult: extracted.awtsmoosResult
  };
}

function detectObviousRuntimeErrors(files = {}) {
  const errors = [];
  for (const script of scriptSources(files)) {
    for (const match of script.source.matchAll(/throw\s+new\s+Error\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      errors.push({
        file: script.name,
        name: 'Error',
        message: match[1],
        kind: 'static-runtime-error-preflight'
      });
    }
  }
  return errors;
}

function summarizeMerkavaRun(run) {
  const result = run?.result || run;
  const web = result?.web;
  const document = web?.document;
  const ids = {};
  if (document?.byId instanceof Map) {
    for (const [id, element] of document.byId.entries()) ids[id] = elementSummary(element);
  }
  return {
    ok: result?.ok !== false,
    scripts: Array.isArray(result?.scripts)
      ? result.scripts.map(script => ({
        name: script.name || '',
        target: script.target || '',
        event: script.event || '',
        result: script.result && JSON.parse(JSON.stringify(script.result))
      }))
      : [],
    web: document ? {
      root: elementSummary(document.documentElement || document.root || null),
      ids
    } : null
  };
}

export async function compileMerkavaRuntime(options = {}) {
  const input = resolveRuntimeInput(options);
  const compiled = await merkava.compileMerkavaApp({
    files: input.files,
    entry: input.entry || 'index.html'
  });
  return { ...compiled, input };
}

export function runMerkavaRuntime(bytecode, options = {}) {
  const run = merkava.runMerkavaApp(bytecode, options);
  return { ...run, result: summarizeMerkavaRun(run) };
}

export async function simulateMerkavaRuntime(options = {}) {
  const input = resolveRuntimeInput(options);
  const preflightErrors = detectObviousRuntimeErrors(input.files);
  const compiled = await compileMerkavaRuntime({ ...options, files: input.files, entry: input.entry });
  const run = runMerkavaRuntime(compiled.bytecode, options.runOptions || options);
  let observable = null;
  let observableErrors = [];
  try {
    observable = await runObservableRuntime(input, options);
    if (observable.interactionError) observableErrors.push(observable.interactionError);
  } catch (error) {
    observableErrors.push({ message: error.message, stack: error.stack || '' });
  }
  const ok = run.ok !== false && preflightErrors.length === 0 && observableErrors.length === 0;
  return {
    BH: 'B"H',
    ok,
    runtime: options.runtime || 'browser',
    engine: 'merkava',
    entry: input.entry || options.entry || 'index.html',
    input: { source: input.source, files: Object.keys(input.files || {}), root: input.root || null },
    bytecode: {
      kind: compiled.kind,
      magic: compiled.magic,
      bytes: compiled.bytecode.length,
      base64: compiled.bytecode64
    },
    result: {
      ...run.result,
      ok,
      snapshot: observable?.snapshot || null,
      errors: [...preflightErrors, ...observableErrors]
    },
    domSnapshot: observable?.domSnapshot || null,
    console: observable?.console || null,
    values: observable?.values || {},
    awtsmoosResult: observable?.awtsmoosResult,
    interactions: options.interactions || [],
    interactionLog: observable?.interactionLog || [],
    interactionError: observable?.interactionError || null,
    errors: [...preflightErrors, ...observableErrors],
    score: ok ? 100 : 40,
    suggestions: preflightErrors.length ? ['Merkava preflight found a script throw before bytecode execution.'] : []
  };
}

export async function compileAndRunMerkavaJs(source = '', options = {}) {
  return merkava.compileAndRunMerkavaJs(source, options);
}

export function inspectMerkava(bytecode) {
  return merkava.inspectMerkava(bytecode);
}
