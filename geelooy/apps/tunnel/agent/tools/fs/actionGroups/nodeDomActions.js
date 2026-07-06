// B"H
const fs = require('fs');
const path = require('path');
const { simulateNodeDomRuntime } = require('../nodeDomRuntime/index.js');
const { safePath } = require('../pathGuard.js');

/**
 * Browser-like actions backed by the existing node-dom runtime.
 *
 * These names mirror the public brainstorm API while routing to one simulator
 * implementation that already supports HTML hydration, scripts, events,
 * selector actions, snapshots, console capture, and return values.
 */
function buildNodeDomActions(ctx = {}) {
  const { config, payload } = ctx;
  return {
    nodeDomRun: () => run(payload),
    nodeDomEval: () => evalDom(payload),
    nodeDomSnapshot: () => action(payload, { action: 'snapshot' }, 'nodeDomSnapshot'),
    nodeDomClick: () => action(payload, { action: 'click', selector: payload.selector }, 'nodeDomClick'),
    nodeDomType: () => action(payload, { action: payload.fill === true ? 'fill' : 'type', selector: payload.selector, text: payload.text ?? payload.value ?? '' }, 'nodeDomType'),
    nodeDomSubmit: () => action(payload, { action: 'evaluate', expression: submitExpression(payload.selector) }, 'nodeDomSubmit'),
    nodeDomQuery: () => query(payload),
    nodeDomDiff: () => diff(payload),
    nodeDomConsole: () => consoleOut(payload),
    nodeDomNetworkMock: () => run({ ...payload, networkMock: payload.networkMock || payload.mocks || {} }),
    nodeDomStorage: () => storage(payload),
    nodeDomRoute: () => run({ ...payload, route: payload.route || payload.url || '' }),
    nodeDomTest: () => run({ ...payload, browserActions: normalizeActions(payload) }),
    virtualDomTest: () => run({ ...payload, browserActions: normalizeActions(payload) }),
    isolatedNodeCheck: () => nodeCheck(config, payload),
    nodePackageScripts: () => packageScripts(config, payload),
    nodeResolve: () => nodeResolve(config, payload),
    nodeRequire: () => nodeRequire(config, payload),
    nodeVersionDoctor: () => nodeVersionDoctor()
  };
}

async function run(payload = {}) {
  const result = await simulateNodeDomRuntime(options(payload));
  return { ...result, action: payload.action || 'nodeDomRun', runtimeAction: 'simulateRuntime' };
}

async function evalDom(payload = {}) {
  const expression = payload.expression || payload.script || 'document.documentElement.outerHTML';
  const result = await simulateNodeDomRuntime({ ...options(payload), returnValues: [expression] });
  return { ok: result.ok !== false, action: 'nodeDomEval', expression, value: result.values?.[expression], runtime: result };
}

async function action(payload = {}, step = {}, name = 'nodeDomRun') {
  if (['click', 'type', 'fill'].includes(step.action) && !step.selector) return { ok: false, action: name, error: 'missing_selector' };
  const result = await simulateNodeDomRuntime({ ...options(payload), browserActions: [...normalizeActions(payload), step] });
  return { ok: result.ok !== false, action: name, step, interactionLog: result.interactionLog || [], runtime: result };
}

async function query(payload = {}) {
  const selector = payload.selector || '*';
  const expression = `Array.from(document.querySelectorAll(${JSON.stringify(selector)})).map(el=>({tag:el.tagName,id:el.id||'',className:String(el.className||''),text:(el.innerText||el.value||'').trim()}))`;
  const result = await simulateNodeDomRuntime({ ...options(payload), returnValues: [expression] });
  const items = result.values?.[expression] || [];
  return { ok: result.ok !== false, action: 'nodeDomQuery', selector, count: items.length, items, runtime: result };
}

async function diff(payload = {}) {
  const left = await simulateNodeDomRuntime(options({ ...payload, html: payload.leftHtml || payload.beforeHtml || payload.html || '' }));
  const right = await simulateNodeDomRuntime(options({ ...payload, html: payload.rightHtml || payload.afterHtml || payload.otherHtml || '' }));
  const leftText = left.domSnapshot?.documentElement?.textContent || JSON.stringify(left.domSnapshot || {});
  const rightText = right.domSnapshot?.documentElement?.textContent || JSON.stringify(right.domSnapshot || {});
  return { ok: left.ok !== false && right.ok !== false, action: 'nodeDomDiff', changed: leftText !== rightText, leftChars: leftText.length, rightChars: rightText.length, left, right };
}

async function consoleOut(payload = {}) {
  const result = await simulateNodeDomRuntime(options(payload));
  return { ok: result.ok !== false, action: 'nodeDomConsole', console: Array.isArray(result.console) ? result.console : [], rawConsole: result.console || null, errors: result.errors || [], runtime: result };
}

async function storage(payload = {}) {
  const expression = `({localStorage:Object.fromEntries(Object.entries(localStorage||{})),sessionStorage:Object.fromEntries(Object.entries(sessionStorage||{}))})`;
  const result = await simulateNodeDomRuntime({ ...options(payload), returnValues: [expression] });
  return { ok: result.ok !== false, action: 'nodeDomStorage', storage: result.values?.[expression] || {}, runtime: result };
}

function options(payload = {}) {
  return {
    ...payload,
    engine: 'node-dom',
    runtime: 'browser',
    html: payload.html || '<body></body>',
    files: parseMaybe(payload.files, payload.files || {}),
    entry: payload.entry || 'index.html',
    browserActions: normalizeActions(payload),
    returnValues: parseMaybe(payload.returnValues || payload.values, payload.returnValues || payload.values || []),
    waitMs: Number(payload.waitMs || 0),
    timeoutMs: Number(payload.timeoutMs || 30000),
    format: 'json'
  };
}

function normalizeActions(payload = {}) {
  const raw = parseMaybe(payload.browserActions || payload.pageActions || payload.actions || payload.steps || payload.actionsJson, []);
  return Array.isArray(raw) ? raw : [];
}

function parseMaybe(value, fallback) {
  if (value == null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function submitExpression(selector) {
  return `(() => { const el = document.querySelector(${JSON.stringify(selector || 'form')}); if (!el) return {ok:false,error:'not_found'}; const form = el.tagName === 'FORM' ? el : el.closest('form'); if (!form) return {ok:false,error:'form_not_found'}; form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); return {ok:true}; })()`;
}

async function nodeCheck(config = {}, payload = {}) {
  const p = payload.path || payload.p || '.';
  const full = safePath(config, p);
  return await new Promise(resolve => {
    require('child_process').execFile(process.execPath, ['--check', full], { cwd: path.dirname(full), timeout: Number(payload.timeoutMs || 30000), windowsHide: true }, (error, stdout, stderr) => {
      resolve({ ok: !error, action: 'isolatedNodeCheck', path: p, exitCode: error?.code ?? 0, stdout: String(stdout || ''), stderr: String(stderr || ''), error: error ? error.message : null });
    });
  });
}

function packageScripts(config = {}, payload = {}) {
  const file = safePath(config, payload.path || 'package.json');
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { ok: true, action: 'nodePackageScripts', path: payload.path || 'package.json', scripts: pkg.scripts || {}, packageManager: packageManager(config) };
}

function nodeResolve(config = {}, payload = {}) {
  const specifier = payload.specifier || payload.module || payload.name;
  if (!specifier) return { ok: false, action: 'nodeResolve', error: 'missing_specifier' };
  try { return { ok: true, action: 'nodeResolve', specifier, resolved: require.resolve(specifier, { paths: [safePath(config, payload.cwd || '.')] }) }; }
  catch (error) { return { ok: false, action: 'nodeResolve', specifier, error: error.message }; }
}

function nodeRequire(config = {}, payload = {}) {
  const resolved = nodeResolve(config, payload);
  if (!resolved.ok) return { ...resolved, action: 'nodeRequire' };
  try {
    const mod = require(resolved.resolved);
    return { ok: true, action: 'nodeRequire', resolved: resolved.resolved, keys: Object.keys(mod || {}).slice(0, 100), type: typeof mod };
  } catch (error) {
    return { ok: false, action: 'nodeRequire', resolved: resolved.resolved, error: error.message };
  }
}

function nodeVersionDoctor() {
  return { ok: true, action: 'nodeVersionDoctor', node: process.version, execPath: process.execPath, platform: process.platform, versions: process.versions };
}

function packageManager(config = {}) {
  for (const file of ['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json']) if (fs.existsSync(path.join(config.root || process.cwd(), file))) return file.replace(/-lock\.yaml|-lock\.json|\.lock/, '');
  return 'npm';
}

module.exports = { buildNodeDomActions, options, normalizeActions };
