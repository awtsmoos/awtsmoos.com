// B"H
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { loadConfig } = require('../../geelooy/apps/tunnel/agent/lib/config.js');
const { collectOptions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');
const target = process.argv[2] || 'geelooy/apps/tunnel-control/index.html';
const tracePath = 'AI_THOUGHTS/runtime-stress/trace-one.jsonl';
fs.writeFileSync(tracePath, '');
function trace(stage, extra = {}) {
  fs.appendFileSync(tracePath, JSON.stringify({ at: new Date().toISOString(), stage, ...extra }) + '\n');
}
function timeout(promise, ms, stage) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve({ __timeout: true, stage, ms }), ms))
  ]);
}
(async () => {
  const config = loadConfig();
  trace('start', { target });
  const options = await timeout(collectOptions({ action: 'simulateRuntime', p: target, waitMs: 0, timeoutMs: 5000 }, config), 5000, 'collectOptions');
  if (options.__timeout) { trace('timeout', options); return process.exit(2); }
  trace('after-collectOptions', { entry: options.entry, fileCount: Object.keys(options.files || {}).length, envOk: options.virtualEnv && options.virtualEnv.ok, diagnostics: (options.virtualEnv && options.virtualEnv.diagnostics || []).slice(0, 3) });
  const servicePath = path.resolve('geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js');
  const service = await timeout(import(pathToFileURL(servicePath).href + '?trace=' + Date.now()), 5000, 'serviceImport');
  if (service.__timeout) { trace('timeout', service); return process.exit(2); }
  trace('after-serviceImport', { hasSim: typeof service.simulateRuntime });
  const result = await timeout(service.simulateRuntime(options), 5000, 'simulateRuntime');
  if (result.__timeout) { trace('timeout', result); return process.exit(2); }
  trace('after-simulateRuntime', { ok: result.ok, error: result.error, engine: result.engine, values: result.values });
  fs.writeFileSync('AI_THOUGHTS/runtime-stress/trace-one-result.json', JSON.stringify(result, null, 2));
  process.exit(0);
})().catch(error => { trace('caught', { message: error.message, stack: error.stack }); process.exit(1); });
